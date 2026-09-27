'use client';

import { useAppStore } from '@/store';
import { MapViewClient } from '@/components/map/map-view-client';
import { RouteTimeline } from '@/components/trip/route-timeline';
import { TripEmptyActions } from '@/components/trip/trip-empty-actions';
import { EmptyState } from '@/components/ui/empty-state';
import { Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RouteAnalysisPage() {
  const trip = useAppStore((s) => s.trip);

  if (!trip) {
    return (
      <EmptyState
        icon={Map}
        title="No route to analyze"
        description="Plan a trip first to see the route map and timeline with all stops and rests."
        action={<TripEmptyActions />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text">Route Analysis</h1>
        <p className="mt-2 text-text-secondary">
          Interactive map and stop-by-stop timeline for the active trip.
        </p>
      </div>

      <MapViewClient trip={trip} height="700px" />

      <Card glow>
        <CardHeader>
          <CardTitle>Route Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <RouteTimeline trip={trip} />
        </CardContent>
      </Card>
    </div>
  );
}
