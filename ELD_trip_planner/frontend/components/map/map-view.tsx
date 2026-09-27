'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { chartColors, spotter } from '@/lib/theme';
import type { Trip } from '@/types/trip';
import { eventTypeLabel } from '@/lib/utils';

import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

function makeIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="40">
      <path fill="${color}" stroke="white" stroke-width="1.5"
            d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -36],
  });
}

const startIcon = makeIcon(chartColors.pickup);
const pickupIcon = makeIcon(spotter.mint);
const dropoffIcon = makeIcon(chartColors.dropoff);
const stopIcon = makeIcon('#F59E0B');

function FitBounds({ trip }: { trip: Trip }) {
  const map = useMap();
  useEffect(() => {
    const coords = trip.route_geometry?.coordinates || [];
    if (coords.length === 0) return;
    const bounds = L.latLngBounds(coords.map(([lng, lat]) => [lat, lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [trip, map]);
  return null;
}

interface MapViewProps {
  trip: Trip;
  height?: string;
}

export default function MapView({ trip, height = '700px' }: MapViewProps) {
  const polyline: [number, number][] = (trip.route_geometry?.coordinates || []).map(
    ([lng, lat]) => [lat, lng]
  );
  const center: [number, number] = polyline[0] || [39.5, -98.35];

  const stops = trip.events.filter(
    (e) => e.type === 'FUEL' || e.type === 'REST_10' || e.type === 'BREAK_30'
  );

  const totalMiles = trip.total_distance_miles || 1;
  const stopMarkers = stops.map((s, i) => {
    const milesUpToStop = trip.events
      .slice(0, trip.events.indexOf(s))
      .reduce((acc, e) => acc + (e.miles || 0), 0);
    const frac = Math.min(0.99, Math.max(0.01, milesUpToStop / totalMiles));
    const idx = Math.floor(frac * (polyline.length - 1));
    const pos = polyline[idx] || center;
    return { id: i, pos, ev: s };
  });

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 glow-accent" style={{ height }}>
      <MapContainer center={center} zoom={5} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {polyline.length > 0 && (
          <Polyline positions={polyline} color={spotter.mint} weight={4} opacity={0.85} />
        )}
        <Marker position={[trip.coords.current[1], trip.coords.current[0]]} icon={startIcon}>
          <Popup>
            <strong>Start</strong>
            <br />
            {trip.current_location}
          </Popup>
        </Marker>
        <Marker position={[trip.coords.pickup[1], trip.coords.pickup[0]]} icon={pickupIcon}>
          <Popup>
            <strong>Pickup</strong>
            <br />
            {trip.pickup_location}
          </Popup>
        </Marker>
        <Marker position={[trip.coords.dropoff[1], trip.coords.dropoff[0]]} icon={dropoffIcon}>
          <Popup>
            <strong>Dropoff</strong>
            <br />
            {trip.dropoff_location}
          </Popup>
        </Marker>
        {stopMarkers.map((m) => (
          <Marker key={m.id} position={m.pos} icon={stopIcon}>
            <Popup>
              <strong>{eventTypeLabel(m.ev.type)}</strong>
              <br />
              {m.ev.notes || m.ev.location}
              <br />
              {m.ev.duration_hours}h
            </Popup>
          </Marker>
        ))}
        <FitBounds trip={trip} />
      </MapContainer>
    </div>
  );
}
