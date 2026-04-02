// layout.tsx — 根版面配置：HTML head（字型、metadata）、全域 CSS 載入

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Progress Tracker",
  description: "Track your course progress and sport activities",
  manifest: "/manifest.json",
  themeColor: "#e4007c",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Progress",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
