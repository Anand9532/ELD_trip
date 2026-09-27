'use client';

import { motion } from 'framer-motion';
import type { Trip } from '@/types/trip';
import { fmtDateTime, fmtHours, fmtMiles, statusColor, statusLabel, eventTypeLabel } from '@/lib/utils';

import { chartColors } from '@/lib/theme';

const EVENT_COLORS: Record<string, string> = {
  DRIVING: chartColors.driving,
  PICKUP: chartColors.pickup,
  DROPOFF: chartColors.dropoff,
  FUEL: chartColors.fuel,
  BREAK_30: chartColors.break,
  REST_10: chartColors.rest,
  OFF_DUTY: chartColors.offDuty,
};

export function RouteTimeline({ trip }: { trip: Trip }) {
  return (
    <div className="space-y-0">
      {trip.events.map((e, i) => {
        const color = EVENT_COLORS[e.type] || statusColor(e.status);
        const isLast = i === trip.events.length - 1;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center">
              <motion.div
                className="h-4 w-4 rounded-full border-2 flex-shrink-0 z-10"
                style={{
                  borderColor: color,
                  backgroundColor: `${color}30`,
                  boxShadow: `0 0 12px ${color}40`,
                }}
                whileHover={{ scale: 1.3 }}
              />
              {!isLast && (
                <div
                  className="w-0.5 flex-1 min-h-[40px] my-1"
                  style={{
                    background: `linear-gradient(to bottom, ${color}60, ${EVENT_COLORS[trip.events[i + 1]?.type] || '#9CA3AF'}60)`,
                  }}
                />
              )}
            </div>

            <div className="flex-1 pb-6 min-w-0">
              <div className="glass rounded-xl p-4 hover:glow-accent-hover transition-all duration-300">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="font-semibold text-text">{eventTypeLabel(e.type)}</h4>
                  <span className="text-xs font-medium text-accent">{fmtHours(e.duration_hours)}</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {fmtDateTime(e.start)} → {fmtDateTime(e.end)} • {statusLabel(e.status)}
                  {e.miles > 0 && <> • {fmtMiles(e.miles)}</>}
                </p>
                {(e.location || e.notes) && (
                  <p className="text-xs text-text-secondary/80 mt-2 italic">
                    {e.location}
                    {e.notes && ` — ${e.notes}`}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
