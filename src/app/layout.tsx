import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Omni',
    description: 'Your Personal AI Assistant',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Omni',
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: '#000000',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="apple-touch-icon" href="/icon-192x192.png" />
            </head>
            <body>{children}</body>
        </html>
    );
}
