'use client';

import type { Trip } from '@/types/trip';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { computeTripMetrics } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { spotter } from '@/lib/theme';

export function HosAnalytics({ trip }: { trip: Trip }) {
  const metrics = computeTripMetrics(trip);

  const onDutyInWindow = trip.events
    .filter((e) => e.status !== 'OFF_DUTY' && e.status !== 'SLEEPER_BERTH')
    .reduce((a, e) => a + e.duration_hours, 0);

  const lastEvent = trip.events[trip.events.length - 1];
  const currentStatus = lastEvent?.status || 'OFF_DUTY';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card glow className="p-6 flex flex-col items-center">
          <ProgressRing
            value={Math.min(onDutyInWindow, 14)}
            max={14}
            label="14-Hour Window"
            sublabel="Duty period"
            color={spotter.mint}
          />
        </Card>
        <Card glow className="p-6 flex flex-col items-center">
          <ProgressRing
            value={Math.min(metrics.totalDriving, 11)}
            max={11}
            label="11-Hour Drive"
            sublabel="Driving limit"
            color={spotter.mintLight}
          />
        </Card>
        <Card glow className="p-6 flex flex-col items-center">
          <ProgressRing
            value={trip.current_cycle_used_hours + metrics.totalDriving + metrics.totalOnDuty}
            max={70}
            label="70-Hour Cycle"
            sublabel="8-day rolling"
            color="#F59E0B"
          />
        </Card>
        <Card glow className="p-6 flex flex-col items-center">
          <ProgressRing
            value={metrics.remainingCycle}
            max={70}
            label="Cycle Remaining"
            sublabel="Available hours"
            color={spotter.coral}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Current Duty Status"
          value={currentStatus.replace(/_/g, ' ')}
          badge={lastEvent?.type || '—'}
        />
        <StatusCard
          title="30-Min Break"
          value={
            trip.events.some((e) => e.type === 'BREAK_30') ? 'Required breaks taken' : 'Not yet required'
          }
          badge={trip.events.filter((e) => e.type === 'BREAK_30').length + ' breaks'}
        />
        <StatusCard
          title="Fuel Stops"
          value={`${metrics.fuelStops} scheduled`}
          badge="Every 1,000 mi"
        />
      </div>
    </div>
  );
}

function StatusCard({
  title,
  value,
  badge,
}: {
  title: string;
  value: string;
  badge: string;
}) {
  return (
    <Card glow hover>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-text-secondary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold text-text capitalize">{value}</p>
        <Badge variant="secondary" className="mt-2">
          {badge}
        </Badge>
      </CardContent>
    </Card>
  );
}
