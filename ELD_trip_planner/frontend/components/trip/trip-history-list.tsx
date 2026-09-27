'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Route,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTrips } from '@/hooks/use-trips';
import { useAppStore } from '@/store';
import { fmtDateTime, fmtMiles } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Trip } from '@/types/trip';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

function TripCard({
  trip,
  active,
  onSelect,
  index,
}: {
  trip: Trip;
  active: boolean;
  onSelect: (trip: Trip) => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onSelect(trip)}
      className="w-full text-left"
    >
      <Card
        hover
        className={cn(
          'p-5 transition-all',
          active && 'ring-2 ring-accent/40 glow-accent border-accent/30'
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {active && <Badge variant="success">Active</Badge>}
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {fmtDateTime(trip.created_at)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span className="text-text truncate">{trip.current_location}</span>
              </div>
              <div className="flex items-start gap-2 text-sm pl-6">
                <span className="text-text-secondary">→</span>
                <span className="text-text-secondary truncate">{trip.pickup_location}</span>
              </div>
              <div className="flex items-start gap-2 text-sm pl-6">
                <span className="text-accent">→</span>
                <span className="text-text font-medium truncate">{trip.dropoff_location}</span>
              </div>
            </div>
          </div>

          <ArrowRight className="h-5 w-5 text-text-secondary shrink-0 mt-1 group-hover:text-accent" />
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/8 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Route className="h-3.5 w-3.5 text-accent" />
            {fmtMiles(trip.total_distance_miles)}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-accent" />
            {trip.daily_logs?.length ?? 0} log sheets
          </span>
          {trip.driver_name && (
            <span className="truncate">Driver: {trip.driver_name}</span>
          )}
        </div>
      </Card>
    </motion.button>
  );
}

export function TripHistoryList() {
  const router = useRouter();
  const activeTrip = useAppStore((s) => s.trip);
  const setTrip = useAppStore((s) => s.setTrip);
  const { data: trips, isLoading, isError, refetch } = useTrips();

  const handleSelect = (trip: Trip) => {
    setTrip(trip);
    toast.success('Trip loaded', {
      description: `${trip.current_location} → ${trip.dropoff_location}`,
    });
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={Route}
        title="Could not load trips"
        description="Make sure the backend is running and NEXT_PUBLIC_API_BASE is set correctly."
        action={
          <Button onClick={() => refetch()}>Retry</Button>
        }
      />
    );
  }

  if (!trips?.length) {
    return (
      <EmptyState
        icon={Route}
        title="No trips yet"
        description="Plan your first trip to see it saved here. Every planned trip is stored in the database."
        action={
          <Link href="/trip-planner">
            <Button>Plan a Trip</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {trips.map((trip, i) => (
        <TripCard
          key={trip.id}
          trip={trip}
          index={i}
          active={activeTrip?.id === trip.id}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
