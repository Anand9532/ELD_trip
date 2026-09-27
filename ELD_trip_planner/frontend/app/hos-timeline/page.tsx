'use client';

import { useAppStore } from '@/store';
import { HosAnalytics } from '@/components/hos/hos-analytics';
import { RouteTimeline } from '@/components/trip/route-timeline';
import { TripEmptyActions } from '@/components/trip/trip-empty-actions';
import { EmptyState } from '@/components/ui/empty-state';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HosTimelinePage() {
  const trip = useAppStore((s) => s.trip);

  if (!trip) {
    return (
      <EmptyState
        icon={Clock}
        title="No HOS data available"
        description="Generate a trip plan to view hours-of-service analytics and duty status timeline."
        action={<TripEmptyActions />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text">HOS Timeline</h1>
        <p className="mt-2 text-text-secondary">
          Duty status breakdown and event timeline for the active trip.
        </p>
      </div>

      <HosAnalytics trip={trip} />

      <Card glow>
        <CardHeader>
          <CardTitle>Duty Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <RouteTimeline trip={trip} />
        </CardContent>
      </Card>
    </div>
  );
}
