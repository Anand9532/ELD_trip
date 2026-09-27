import type { Trip, TripInput } from '@/types/trip';
import { getApiBase } from '@/lib/api-config';

export interface PlaceSuggestion {
  display_name: string;
  lng: number;
  lat: number;
}

function apiUrl(path: string): string {
  const base = getApiBase();
  if (!base) {
    throw new Error(
      'API URL is not configured. Set NEXT_PUBLIC_API_BASE in your environment (Vercel project settings for production).'
    );
  }
  return `${base}${path}`;
}

export async function planTrip(input: TripInput): Promise<Trip> {
  const resp = await fetch(apiUrl('/api/trips/plan/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!resp.ok) {
    let msg = `Request failed (${resp.status})`;
    try {
      const data = await resp.json();
      msg = data.error || JSON.stringify(data);
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return resp.json();
}

export async function listTrips(): Promise<Trip[]> {
  const resp = await fetch(apiUrl('/api/trips/'));
  if (!resp.ok) throw new Error('Failed to load trips');
  return resp.json();
}

export async function suggestPlaces(query: string): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  try {
    const resp = await fetch(
      apiUrl(`/api/places/suggest/?q=${encodeURIComponent(q)}`)
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || [];
  } catch {
    return [];
  }
}
