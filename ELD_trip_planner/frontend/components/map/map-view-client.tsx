'use client';

import dynamic from 'next/dynamic';
import type { Trip } from '@/types/trip';
import { MapSkeleton } from '@/components/ui/skeleton';

const MapView = dynamic(() => import('@/components/map/map-view'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export function MapViewClient({ trip, height }: { trip: Trip; height?: string }) {
  return <MapView trip={trip} height={height} />;
}
