'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { spotter } from '@/lib/theme';

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  icon: LucideIcon;
  color?: string;
  delay?: number;
}

export function MetricCard({
  label,
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  icon: Icon,
  color = spotter.mint,
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card hover glow className="p-6 group cursor-default">
        <div className="flex items-start justify-between">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center border transition-colors"
            style={{
              backgroundColor: `${color}15`,
              borderColor: `${color}30`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-text mt-1">
            <AnimatedCounter
              value={value}
              decimals={decimals}
              suffix={suffix}
              prefix={prefix}
            />
          </p>
        </div>
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 100%, ${color}08 0%, transparent 70%)`,
          }}
        />
      </Card>
    </motion.div>
  );
}
