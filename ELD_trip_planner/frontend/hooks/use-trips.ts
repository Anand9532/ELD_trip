'use client';

import { useQuery } from '@tanstack/react-query';
import { listTrips } from '@/services/api';

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: listTrips,
  });
}
