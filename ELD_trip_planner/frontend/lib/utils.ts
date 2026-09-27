import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { chartColors } from '@/lib/theme';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtHours(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
}

export function fmtMiles(m: number): string {
  return `${m.toLocaleString(undefined, { maximumFractionDigits: 0 })} mi`;
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusColor(status: string): string {
  switch (status) {
    case 'DRIVING':
      return chartColors.driving;
    case 'ON_DUTY_NOT_DRIVING':
      return chartColors.onDuty;
    case 'SLEEPER_BERTH':
      return chartColors.sleeper;
    case 'OFF_DUTY':
    default:
      return chartColors.offDuty;
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'DRIVING':
      return 'Driving';
    case 'ON_DUTY_NOT_DRIVING':
      return 'On duty (not driving)';
    case 'SLEEPER_BERTH':
      return 'Sleeper berth';
    case 'OFF_DUTY':
      return 'Off duty';
    default:
      return status;
  }
}

export function eventTypeLabel(t: string): string {
  switch (t) {
    case 'DRIVING':
      return 'Driving';
    case 'PICKUP':
      return 'Pickup (1 hour)';
    case 'DROPOFF':
      return 'Dropoff (1 hour)';
    case 'FUEL':
      return 'Fuel stop';
    case 'BREAK_30':
      return '30-minute break';
    case 'REST_10':
      return '10-hour off-duty rest';
    case 'OFF_DUTY':
      return '34-hour cycle restart';
    default:
      return t;
  }
}

export function computeTripMetrics(trip: import('@/types/trip').Trip) {
  const totalDriving = trip.events
    .filter((e) => e.status === 'DRIVING')
    .reduce((a, e) => a + e.duration_hours, 0);
  const totalOnDuty = trip.events
    .filter((e) => e.status === 'ON_DUTY_NOT_DRIVING')
    .reduce((a, e) => a + e.duration_hours, 0);
  const totalTrip = trip.events.reduce((a, e) => a + e.duration_hours, 0);
  const fuelStops = trip.events.filter((e) => e.type === 'FUEL').length;
  const remainingCycle = Math.max(
    0,
    70 - (trip.current_cycle_used_hours + totalDriving + totalOnDuty)
  );
  return {
    totalDriving,
    totalOnDuty,
    totalTrip,
    fuelStops,
    remainingCycle,
    days: trip.daily_logs.length,
    logSheets: trip.daily_logs.length,
  };
}
