export type DutyStatus =
  | 'OFF_DUTY'
  | 'SLEEPER_BERTH'
  | 'DRIVING'
  | 'ON_DUTY_NOT_DRIVING';

export interface TripEvent {
  type: string;
  status: DutyStatus;
  start: string;
  end: string;
  duration_hours: number;
  miles: number;
  location: string;
  notes: string;
}

export interface DailyLogSegment {
  status: DutyStatus;
  start_hour: number;
  end_hour: number;
  label: string;
}

export interface DailyLogRemark {
  time_hour: number;
  text: string;
}

export interface DailyLog {
  log_date: string;
  segments: DailyLogSegment[];
  totals: Record<DutyStatus, number>;
  remarks: DailyLogRemark[];
  total_miles: number;
}

export interface Trip {
  id: string;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used_hours: number;
  trip_start_time: string;
  driver_name: string;
  co_driver_name: string;
  carrier_name: string;
  main_office_address: string;
  truck_number: string;
  trailer_number: string;
  total_distance_miles: number;
  total_duration_minutes: number;
  route_geometry: { type: 'LineString'; coordinates: [number, number][] };
  events: TripEvent[];
  daily_logs: DailyLog[];
  coords: {
    current: [number, number];
    pickup: [number, number];
    dropoff: [number, number];
  };
  created_at: string;
}

export interface TripInput {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used_hours: number;
  trip_start_time?: string;
  driver_name?: string;
  co_driver_name?: string;
  carrier_name?: string;
  main_office_address?: string;
  truck_number?: string;
  trailer_number?: string;
}
