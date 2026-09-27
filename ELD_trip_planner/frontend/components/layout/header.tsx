'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Route,
  Map,
  Clock,
  FileText,
  History,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { useHydrated } from '@/hooks/use-hydrated';
import { SpotterLogo } from '@/components/ui/spotter-logo';
import { Badge } from '@/components/ui/badge';

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, short: 'Home' },
  { href: '/trips', label: 'All Trips', icon: History, short: 'Trips' },
  { href: '/trip-planner', label: 'Trip Planner', icon: Route, short: 'Plan' },
  { href: '/route-analysis', label: 'Route Analysis', icon: Map, short: 'Route' },
  { href: '/hos-timeline', label: 'HOS Timeline', icon: Clock, short: 'HOS' },
  { href: '/eld-logs', label: 'ELD Logs', icon: FileText, short: 'Logs' },
];

function driverInitials(name?: string) {
  if (!name?.trim()) return 'SP';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** First segment before comma — "New York, United States" → "New York" */
function shortPlace(name: string) {
  const part = name.split(',')[0]?.trim();
  return part || name;
}

export function Header() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const trip = useAppStore((s) => s.trip);
  const setTrip = useAppStore((s) => s.setTrip);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const clearTrip = () => {
    setTrip(null);
    setProfileOpen(false);
  };

  const initials = driverInitials(trip?.driver_name);

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 lg:gap-4">
        <Link href="/" className="shrink-0 hover:opacity-90 transition-opacity">
          <SpotterLogo size="sm" />
        </Link>

        <nav className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-0.5 xl:gap-1 p-1 rounded-2xl glass border border-white/8 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="shrink-0">
                <motion.div
                  className={cn(
                    'relative flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 2xl:px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap',
                    active ? 'text-accent' : 'text-text-secondary hover:text-text'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-accent/10 border border-accent/25 rounded-xl glow-accent"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="h-4 w-4 relative z-10 shrink-0" />
                  <span className="relative z-10 lg:inline xl:hidden">{item.short}</span>
                  <span className="relative z-10 hidden xl:inline">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div ref={profileRef} className="flex items-center gap-2 shrink-0 relative ml-auto lg:ml-0">
          {hydrated && trip && (
            <Badge variant="success" className="hidden 2xl:inline-flex text-[10px] px-2 py-0.5">
              Trip active
            </Badge>
          )}
          {hydrated && trip && (
            <p
              className="hidden 2xl:block text-[10px] text-text-secondary truncate max-w-[140px]"
              title={`${trip.current_location} → ${trip.dropoff_location}`}
            >
              {shortPlace(trip.current_location)} → {shortPlace(trip.dropoff_location)}
            </p>
          )}
          <button
            onClick={() => setProfileOpen((s) => !s)}
            className="h-9 w-9 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold hover:bg-accent/25 transition-colors"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            {initials}
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-xl glass-strong border border-white/10 p-2 z-50 shadow-2xl">
              {trip && (
                <p className="px-3 py-2 text-xs text-text-secondary border-b border-white/8 mb-1 line-clamp-2">
                  {trip.current_location} → {trip.dropoff_location}
                </p>
              )}
              {trip?.driver_name && (
                <p className="px-3 py-2 text-sm font-medium text-text truncate">
                  {trip.driver_name}
                </p>
              )}
              <button
                onClick={clearTrip}
                disabled={!trip}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear Active Trip
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
