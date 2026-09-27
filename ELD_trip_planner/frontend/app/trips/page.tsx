'use client';

import { TripHistoryList } from '@/components/trip/trip-history-list';

export default function TripsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text">All Trips</h1>
        <p className="mt-2 text-text-secondary max-w-2xl">
          Browse every planned trip saved in the database. Click a trip to load it on the dashboard.
        </p>
      </div>

      <TripHistoryList />
    </div>
  );
}
