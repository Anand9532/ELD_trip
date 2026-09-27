'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TruckAnimation = dynamic(
  () => import('@/components/hero/truck-animation').then((m) => m.TruckAnimation),
  { ssr: false, loading: () => <div className="w-full h-[400px] animate-pulse bg-white/5 rounded-2xl" /> }
);

export function DashboardHero() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-medium mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-coral animate-pulse" />
          Spotter.ai • FMCSA 70hr/8day
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          <span className="text-gradient">HOS Route Intelligence</span>
          <br />
          <span className="text-text">Platform</span>
        </h1>
        <p className="mt-4 text-lg text-text-secondary max-w-lg leading-relaxed">
          Plan FMCSA-compliant routes, generate ELD logs, and optimize long-haul operations.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/trip-planner">
            <Button size="lg" className="gap-2">
              Plan New Trip
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/eld-logs">
            <Button variant="secondary" size="lg">
              View ELD Logs
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <div className="rounded-2xl glass glow-accent border-glow overflow-hidden h-[400px]">
          <TruckAnimation />
        </div>
        <div className="absolute -inset-4 bg-accent/5 rounded-3xl blur-3xl -z-10" />
      </motion.div>
    </div>
  );
}
