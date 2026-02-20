import { NextResponse } from 'next/server';

// Map iCal PRIORITY values to our app's priority levels
// iCal: 1-4 = high, 5 = medium, 6-9 = low, 0 = undefined
function mapPriority(icalPriority: string | undefined): 'high' | 'medium' | 'low' | 'none' {
    if (!icalPriority) return 'none';
    const num = parseInt(icalPriority.trim(), 10);
    if (isNaN(num) || num === 0) return 'none';
    if (num <= 4) return 'high';
    if (num === 5) return 'medium';
    return 'low';
}

export async function GET() {
    const ICLOUD_USERNAME = process.env.ICLOUD_USERNAME;
    const ICLOUD_APP_PASSWORD = process.env.ICLOUD_APP_PASSWORD;

    if (!ICLOUD_USERNAME || !ICLOUD_APP_PASSWORD) {
        return NextResponse.json(
            { error: 'iCloud credentials not configured. Set ICLOUD_USERNAME and ICLOUD_APP_PASSWORD in environment variables.' },
            { status: 500 }
        );
    }

    try {
        const { DAVClient } = await import('tsdav');

        const client = new DAVClient({
            serverUrl: 'https://caldav.icloud.com',
            credentials: {
                username: ICLOUD_USERNAME,
                password: ICLOUD_APP_PASSWORD,
            },
            authMethod: 'Basic',
            defaultAccountType: 'caldav',
        });

        // CRITICAL: Must call login() before any fetch operations
        await client.login();

        // Get all calendars
        const calendars = await client.fetchCalendars();

        // Find Reminders calendars (they're VTODO collections)
        const reminderCalendars = calendars.filter(
            (cal: any) => cal.components?.includes('VTODO')
        );

        if (reminderCalendars.length === 0) {
            // Also try calendars without explicit component declaration
            // Some iCloud setups don't expose the components array properly
            const allCalendars = calendars;
            if (allCalendars.length === 0) {
                return NextResponse.json(
                    { error: 'No calendars found. Make sure Reminders sync is enabled for your iCloud account and you are using an app-specific password.' },
                    { status: 404 }
                );
            }
            // If no VTODO calendars found explicitly, return helpful error
            return NextResponse.json(
                { error: `Found ${calendars.length} calendar(s) but none contain reminders (VTODO). Calendar names: ${calendars.map((c: any) => c.displayName).join(', ')}` },
                { status: 404 }
            );
        }

        const allTasks: any[] = [];

        for (const calendar of reminderCalendars) {
            const listName = calendar.displayName || 'Reminders';

            try {
                const calendarObjects = await client.fetchCalendarObjects({
                    calendar,
                });

                for (const obj of calendarObjects) {
                    const vcalData = obj.data;
                    if (!vcalData || !vcalData.includes('VTODO')) continue;

                    // Parse VTODO properties
                    const summaryMatch = vcalData.match(/SUMMARY:(.+)/);
                    const statusMatch = vcalData.match(/STATUS:(.+)/);
                    const dueDateMatch = vcalData.match(/DUE(?:;[^:]*)?:(\d{8}(?:T\d{6}Z?)?)/);
                    const priorityMatch = vcalData.match(/PRIORITY:(.+)/);
                    const descriptionMatch = vcalData.match(/DESCRIPTION:(.+)/);
                    const uidMatch = vcalData.match(/UID:(.+)/);
                    const flaggedMatch = vcalData.match(/X-APPLE-SORT-ORDER:(.+)/);

                    const summary = summaryMatch?.[1]?.trim();
                    const status = statusMatch?.[1]?.trim();
                    const uid = uidMatch?.[1]?.trim();

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

                    // Parse multi-line DESCRIPTION (iCal uses \n and literal line folding)
                    let notes: string | undefined;
                    if (descriptionMatch) {
                        notes = descriptionMatch[1]
                            ?.trim()
                            .replace(/\\n/g, '\n')
                            .replace(/\\,/g, ',')
                            .replace(/\\\\/g, '\\');
                    }

                    const priority = mapPriority(priorityMatch?.[1]);
                    const flagged = vcalData.includes('X-APPLE-FLAGGED:TRUE') ||
                        vcalData.includes('X-APPLE-FLAGGED:1');

                    allTasks.push({
                        id: `icloud-${uid || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`}`,
                        title: summary,
                        status: 'pending',
                        scheduledDate,
                        dueTime,
                        createdAt: new Date().toISOString(),
                        priority,
                        notes: notes || undefined,
                        list: listName,
                        flagged: flagged || undefined,
                        icloudUid: uid || undefined,
                    });
                }
            } catch (calError: any) {
                console.error(`Error fetching calendar "${listName}":`, calError?.message || calError);
                // Continue with other calendars
            }
        }

        return NextResponse.json(allTasks);
    } catch (error: any) {
        console.error('iCloud sync error:', error?.message || error);

        // Provide user-friendly error messages
        let errorMessage = 'Failed to connect to iCloud CalDAV';
        if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
            errorMessage = 'iCloud authentication failed. Check your Apple ID and app-specific password.';
        } else if (error?.message?.includes('network') || error?.message?.includes('ENOTFOUND')) {
            errorMessage = 'Network error connecting to iCloud. Check your internet connection.';
        } else if (error?.message) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
