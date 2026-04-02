// layout.tsx — 根版面配置：HTML head（字型、metadata）、全域 CSS 載入

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Udemy Progress Tracker",
  description: "Track your Udemy course progress daily",
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
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
