'use client';

import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { MetricCard } from '@/components/dashboard/metric-card';
import { TripCharts } from '@/components/charts/trip-charts';
import { useAppStore } from '@/store';
import { computeTripMetrics } from '@/lib/utils';
import { spotter } from '@/lib/theme';
import {
  Route,
  Clock,
  Fuel,
  Gauge,
  Calendar,
  FileText,
} from 'lucide-react';
import { TripEmptyActions } from '@/components/trip/trip-empty-actions';
import { EmptyState } from '@/components/ui/empty-state';

export default function DashboardPage() {
  const trip = useAppStore((s) => s.trip);
  const metrics = trip ? computeTripMetrics(trip) : null;

  return (
    <div className="space-y-8">
      <DashboardHero />

      {trip && metrics ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              label="Total Distance"
              value={trip.total_distance_miles}
              suffix=" mi"
              icon={Route}
              delay={0}
            />
            <MetricCard
              label="Driving Time"
              value={metrics.totalDriving}
              suffix="h"
              decimals={1}
              icon={Clock}
              color={spotter.mint}
              delay={0.1}
            />
            <MetricCard
              label="Fuel Stops"
              value={metrics.fuelStops}
              icon={Fuel}
              color="#F59E0B"
              delay={0.2}
            />
            <MetricCard
              label="Cycle Remaining"
              value={metrics.remainingCycle}
              suffix="h"
              decimals={1}
              icon={Gauge}
              color={spotter.coral}
              delay={0.3}
            />
            <MetricCard
              label="Trip Days"
              value={metrics.days}
              icon={Calendar}
              delay={0.4}
            />
            <MetricCard
              label="Log Sheets"
              value={metrics.logSheets}
              icon={FileText}
              delay={0.5}
            />
          </div>

          <TripCharts trip={trip} />
        </>
      ) : (
        <EmptyState
          icon={Route}
          title="No active trip"
          description="Plan a new trip or open an existing one from your trip history."
          action={<TripEmptyActions primaryLabel="Plan Your First Trip" />}
        />
      )}
    </div>
  );
}
