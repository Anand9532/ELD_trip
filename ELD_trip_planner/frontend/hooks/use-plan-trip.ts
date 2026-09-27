'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { planTrip } from '@/services/api';
import type { TripInput } from '@/types/trip';
import { useAppStore, useWizardStore } from '@/store';
import { toast } from 'sonner';

export function usePlanTrip() {
  const setTrip = useAppStore((s) => s.setTrip);
  const resetWizard = useWizardStore((s) => s.resetWizard);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TripInput) => planTrip(input),
    onSuccess: (trip) => {
      setTrip(trip);
      resetWizard();
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip planned successfully', {
        description: `${trip.daily_logs.length} log sheets generated`,
      });
    },
    onError: (err: Error) => {
      toast.error('Planning failed', { description: err.message });
    },
  });
}
