import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
    const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:user@example.com';

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        return NextResponse.json(
            { error: 'VAPID keys not configured. Run: npx web-push generate-vapid-keys' },
            { status: 500 }
        );
    }

    try {
        const { subscription, title, body, tag, taskId } = await request.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json(
                { error: 'Push subscription is required' },
                { status: 400 }
            );
        }

        const webpush = await import('web-push');

        webpush.setVapidDetails(
            VAPID_EMAIL,
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY
        );

        const payload = JSON.stringify({
            title: title || 'Task Due!',
            body: body || '',
            tag: tag || `task-${taskId || Date.now()}`,
            taskId,
            url: '/',
        });

        await webpush.sendNotification(subscription, payload);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Push notification error:', error?.message || error);

        // Handle expired subscriptions
        if (error?.statusCode === 410 || error?.statusCode === 404) {
            return NextResponse.json(
                { error: 'Subscription expired', expired: true },
                { status: 410 }
            );
        }

        return NextResponse.json(
            { error: error?.message || 'Failed to send notification' },
            { status: 500 }
        );
    }
}
