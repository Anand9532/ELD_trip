'use client';

import { Header } from './header';
import { MobileTabBar } from './mobile-tab-bar';
import { AnimatedBackground } from '@/components/dashboard/animated-background';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary relative">
      <AnimatedBackground />
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-6">{children}</main>
      <MobileTabBar />
    </div>
  );
}
