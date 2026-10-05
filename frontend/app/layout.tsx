import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevPulse TMA Dashboard",
  description: "DevOps telemetry command hub directly inside Telegram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Load the official Telegram Mini App core SDK library before interactivity boots */}
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="antialiased bg-neutral-950 text-neutral-100 selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}
