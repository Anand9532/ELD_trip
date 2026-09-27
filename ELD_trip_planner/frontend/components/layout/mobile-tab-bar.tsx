'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './header';

/** Bottom dock — visible on tablet/mobile only */
export function MobileTabBar() {
  const pathname = usePathname();
  const tabs = NAV_ITEMS;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 pointer-events-none">
      <div className="max-w-lg mx-auto glass-strong rounded-2xl border border-white/10 shadow-2xl flex items-center justify-around px-2 py-2 pointer-events-auto">
        {tabs.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                className={cn(
                  'flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-colors',
                  active ? 'text-accent' : 'text-text-secondary'
                )}
                whileTap={{ scale: 0.92 }}
              >
                <div className="relative">
                  {active && (
                    <motion.div
                      layoutId="mobile-tab-glow"
                      className="absolute -inset-2 bg-accent/15 rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={cn('h-5 w-5 relative z-10', active && 'drop-shadow-[0_0_8px_rgba(77,201,177,0.5)]')} />
                </div>
                <span className="text-[10px] font-medium">{item.short}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
