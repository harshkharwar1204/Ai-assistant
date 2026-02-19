import { NextResponse } from 'next/server';

export async function GET() {
    const ICLOUD_USERNAME = process.env.ICLOUD_USERNAME;
    const ICLOUD_APP_PASSWORD = process.env.ICLOUD_APP_PASSWORD;

    if (!ICLOUD_USERNAME || !ICLOUD_APP_PASSWORD) {
        return NextResponse.json(
            { error: 'iCloud credentials not configured. Set ICLOUD_USERNAME and ICLOUD_APP_PASSWORD in .env.local' },
            { status: 500 }
        );
    }

    try {
        // Dynamic import to avoid bundling issues
        const { createDAVClient } = await import('tsdav');

        const client = await createDAVClient({
            serverUrl: 'https://caldav.icloud.com',
            credentials: {
                username: ICLOUD_USERNAME,
                password: ICLOUD_APP_PASSWORD,
            },
            authMethod: 'Basic',
            defaultAccountType: 'caldav',
        });

        // Get all calendars
        const calendars = await client.fetchCalendars();

        // Find Reminders calendars (they're typically VTODO collections)
        const reminderCalendars = calendars.filter(
            (cal: any) => cal.components?.includes('VTODO')
        );

        if (reminderCalendars.length === 0) {
            return NextResponse.json(
                { error: 'No reminder lists found. Make sure Reminders is enabled for CalDAV.' },
                { status: 404 }
            );
        }

        const allTasks: any[] = [];

        for (const calendar of reminderCalendars) {
            try {
                const calendarObjects = await client.fetchCalendarObjects({
                    calendar,
                });

                for (const obj of calendarObjects) {
                    const vcalData = obj.data;
                    if (!vcalData || !vcalData.includes('VTODO')) continue;

                    // Parse VTODO data
                    const summaryMatch = vcalData.match(/SUMMARY:(.+)/);
                    const statusMatch = vcalData.match(/STATUS:(.+)/);
                    const dueDateMatch = vcalData.match(/DUE(?:;[^:]*)?:(\d{8}(?:T\d{6}Z?)?)/);

                    const summary = summaryMatch?.[1]?.trim();
                    const status = statusMatch?.[1]?.trim();

                    // Skip completed tasks
                    if (!summary || status === 'COMPLETED') continue;

                    let dueTime: string | undefined;
                    let scheduledDate = new Date().toISOString().split('T')[0];

                    if (dueDateMatch) {
                        const raw = dueDateMatch[1];
                        if (raw.length >= 8) {
                            const year = raw.substring(0, 4);
                            const month = raw.substring(4, 6);
                            const day = raw.substring(6, 8);
                            scheduledDate = `${year}-${month}-${day}`;

                            if (raw.length > 8) {
                                const hour = raw.substring(9, 11);
                                const min = raw.substring(11, 13);
                                dueTime = new Date(`${year}-${month}-${day}T${hour}:${min}:00Z`).toISOString();
                            }
                        }
                    }

                    allTasks.push({
                        id: `icloud-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                        title: summary,
                        status: 'pending',
                        scheduledDate,
                        dueTime,
                        createdAt: new Date().toISOString(),
                    });
                }
            } catch (calError) {
                console.error(`Error fetching calendar ${calendar.displayName}:`, calError);
                // Continue with other calendars
            }
        }

        return NextResponse.json(allTasks);
    } catch (error: any) {
        console.error('iCloud sync error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to connect to iCloud CalDAV' },
            { status: 500 }
        );
    }
}
