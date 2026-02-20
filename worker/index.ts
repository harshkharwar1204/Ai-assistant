// Custom service worker code for push notifications
// This file is automatically bundled into sw.js by @ducanh2912/next-pwa
// Using 'any' casts to avoid TS errors in service worker context (compiled separately by next-pwa)

const sw = self as any;

// Handle incoming push notifications
sw.addEventListener('push', (event: any) => {
    if (!event.data) return;

    try {
        const data = event.data.json();

        const title = data.title || 'Task Due!';
        const options = {
            body: data.body || '',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [200, 100, 200],
            tag: data.tag || 'task-notification',
            renotify: true,
            data: {
                url: data.url || '/',
                taskId: data.taskId,
            },
            actions: [
                {
                    action: 'open',
                    title: 'Open App',
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss',
                },
            ],
        };

        event.waitUntil(
            sw.registration.showNotification(title, options)
        );
    } catch {
        // Fallback for non-JSON payloads
        const text = event.data.text();
        event.waitUntil(
            sw.registration.showNotification('Task Due!', {
                body: text,
                icon: '/icon-192x192.png',
                vibrate: [200, 100, 200],
            })
        );
    }
});

// Handle notification click
sw.addEventListener('notificationclick', (event: any) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList: any[]) => {
            // Focus existing window if available
            for (const client of clientList) {
                if (client.url.includes(sw.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open new window
            return sw.clients.openWindow(urlToOpen);
        })
    );
});
