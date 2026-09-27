import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Trip, TripInput } from '@/types/trip';

interface WizardState {
  step: number;
  form: TripInput;
  nextStep: () => void;
  prevStep: () => void;
  updateForm: <K extends keyof TripInput>(key: K, value: TripInput[K]) => void;
  resetWizard: () => void;
}

const defaultForm: TripInput = {
  current_location: '',
  pickup_location: '',
  dropoff_location: '',
  current_cycle_used_hours: 0,
  driver_name: '',
  carrier_name: '',
  main_office_address: '',
  truck_number: '',
  trailer_number: '',
};

export const useWizardStore = create<WizardState>((set) => ({
  step: 0,
  form: { ...defaultForm },
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 4) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  updateForm: (key, value) =>
    set((s) => ({ form: { ...s.form, [key]: value } })),
  resetWizard: () => set({ step: 0, form: { ...defaultForm } }),
}));

interface AppState {
  trip: Trip | null;
  setTrip: (trip: Trip | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      trip: null,
      setTrip: (trip) => set({ trip }),
    }),
    {
      name: 'eld-app-store',
      partialize: (s) => ({ trip: s.trip }),
    }
  )
);
