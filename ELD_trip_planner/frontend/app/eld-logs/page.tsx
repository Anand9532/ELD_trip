'use client';

import { useAppStore } from '@/store';
import { EldLogViewer } from '@/components/logs/eld-log-viewer';
import { TripEmptyActions } from '@/components/trip/trip-empty-actions';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';

export default function EldLogsPage() {
  const trip = useAppStore((s) => s.trip);

  if (!trip) {
    return (
      <EmptyState
        icon={FileText}
        title="No ELD logs generated"
        description="Plan and generate a trip to view, zoom, download, and print your FMCSA daily log sheets."
        action={<TripEmptyActions primaryLabel="Generate Logs" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text">ELD Logs</h1>
        <p className="mt-2 text-text-secondary">
          FMCSA daily log sheets for the active trip.
        </p>
      </div>
      <EldLogViewer trip={trip} />
    </div>
  );
}
