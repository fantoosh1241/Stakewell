import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { IconRail } from '@/components/IconRail';

export const metadata: Metadata = {
  title: 'Stakewell Dashboard',
  description: 'Admin dashboard for Stakewell XLM Staking and RWD Rewards.',
  keywords: ['stellar', 'soroban', 'staking', 'defi', 'dashboard'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#F6F7FB" />
      </head>
      <body className="h-screen w-screen bg-page text-content font-sans flex overflow-hidden">
        <IconRail />
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
          {children}
        </div>
      </body>
    </html>
  );
}
