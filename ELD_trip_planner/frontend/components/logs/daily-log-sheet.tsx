'use client';

import type { DailyLog, Trip } from '@/types/trip';

interface Props {
  trip: Trip;
  log: DailyLog;
  scale?: number;
}

const ROWS = [
  { key: 'OFF_DUTY', label: '1. Off Duty' },
  { key: 'SLEEPER_BERTH', label: '2. Sleeper Berth' },
  { key: 'DRIVING', label: '3. Driving' },
  { key: 'ON_DUTY_NOT_DRIVING', label: '4. On Duty (not driving)' },
];

const GRID_LEFT = 160;
const GRID_RIGHT_PAD = 60;
const ROW_H = 36;
const GRID_TOP = 70;
const SVG_W = 980;
const SVG_H = GRID_TOP + ROW_H * 4 + 130;
const GRID_W = SVG_W - GRID_LEFT - GRID_RIGHT_PAD;
const HOUR_W = GRID_W / 24;

export function DailyLogSheet({ trip, log, scale = 1 }: Props) {
  const rowY = (key: string) =>
    GRID_TOP + ROWS.findIndex((r) => r.key === key) * ROW_H + ROW_H / 2;

  const sorted = [...log.segments].sort((a, b) => a.start_hour - b.start_hour);
  const points: [number, number][] = [];
  sorted.forEach((seg, idx) => {
    const x1 = GRID_LEFT + seg.start_hour * HOUR_W;
    const x2 = GRID_LEFT + seg.end_hour * HOUR_W;
    const y = rowY(seg.status);
    if (idx === 0) points.push([x1, y]);
    else {
      const prevY = points[points.length - 1][1];
      if (prevY !== y) points.push([x1, prevY], [x1, y]);
    }
    points.push([x2, y]);
  });

  const polylinePoints = points.map(([x, y]) => `${x},${y}`).join(' ');
  const dateObj = new Date(log.log_date + 'T00:00:00Z');
  const totals = log.totals as Record<string, number>;

  return (
    <div
      className="log-sheet bg-white rounded-xl p-4"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      data-log-date={log.log_date}
    >
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto">
        <text x={SVG_W / 2} y={20} textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">
          DRIVER&apos;S DAILY LOG
        </text>
        <text x={SVG_W / 2} y={36} textAnchor="middle" fontSize="9" fill="#64748b">
          (ONE CALENDAR DAY — 24 HOURS)
        </text>

        <HeaderField
          x={10}
          y={50}
          label="Date"
          value={dateObj.toLocaleDateString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'UTC',
          })}
        />
        <HeaderField
          x={210}
          y={50}
          label="Total miles driving today"
          value={log.total_miles.toFixed(0)}
        />
        <HeaderField
          x={430}
          y={50}
          label="Vehicle numbers"
          value={[trip.truck_number, trip.trailer_number].filter(Boolean).join(' / ') || '—'}
        />
        <HeaderField x={690} y={50} label="Driver" value={trip.driver_name || '—'} />

        {ROWS.map((row, i) => {
          const y = GRID_TOP + i * ROW_H;
          return (
            <g key={row.key}>
              <text
                x={GRID_LEFT - 8}
                y={y + ROW_H / 2 + 4}
                textAnchor="end"
                fontSize="10"
                fill="#334155"
                fontWeight="600"
              >
                {row.label}
              </text>
              <rect
                x={GRID_LEFT}
                y={y}
                width={GRID_W}
                height={ROW_H}
                fill="white"
                stroke="#1f2937"
                strokeWidth="0.8"
              />
              {Array.from({ length: 25 }).map((_, h) => {
                const x = GRID_LEFT + h * HOUR_W;
                return (
                  <g key={h}>
                    <line x1={x} y1={y} x2={x} y2={y + ROW_H} stroke="#1f2937" strokeWidth="0.6" />
                    {h < 24 &&
                      [0.25, 0.5, 0.75].map((q) => (
                        <line
                          key={q}
                          x1={x + q * HOUR_W}
                          y1={y + ROW_H - (q === 0.5 ? 10 : 6)}
                          x2={x + q * HOUR_W}
                          y2={y + ROW_H}
                          stroke="#475569"
                          strokeWidth="0.4"
                        />
                      ))}
                  </g>
                );
              })}
              <rect
                x={SVG_W - GRID_RIGHT_PAD}
                y={y}
                width={GRID_RIGHT_PAD - 6}
                height={ROW_H}
                fill="#f8fafc"
                stroke="#1f2937"
                strokeWidth="0.6"
              />
              <text
                x={SVG_W - GRID_RIGHT_PAD / 2 - 3}
                y={y + ROW_H / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#0f172a"
              >
                {(totals[row.key] || 0).toFixed(2)}
              </text>
            </g>
          );
        })}

        {Array.from({ length: 25 }).map((_, h) => {
          const x = GRID_LEFT + h * HOUR_W;
          const label = h === 0 || h === 24 ? 'M' : h === 12 ? 'N' : `${h}`;
          return (
            <text key={h} x={x} y={GRID_TOP - 4} textAnchor="middle" fontSize="9" fill="#475569">
              {label}
            </text>
          );
        })}

        <text
          x={SVG_W - GRID_RIGHT_PAD / 2 - 3}
          y={GRID_TOP - 4}
          textAnchor="middle"
          fontSize="9"
          fill="#475569"
          fontWeight="700"
        >
          Total Hrs
        </text>

        <polyline
          points={polylinePoints}
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="2.2"
          strokeLinejoin="miter"
          strokeLinecap="square"
        />

        <rect
          x={GRID_LEFT}
          y={GRID_TOP + ROW_H * 4 + 16}
          width={GRID_W}
          height={90}
          fill="white"
          stroke="#1f2937"
          strokeWidth="0.8"
        />
        <text
          x={GRID_LEFT - 8}
          y={GRID_TOP + ROW_H * 4 + 32}
          textAnchor="end"
          fontSize="10"
          fontWeight="600"
          fill="#334155"
        >
          Remarks
        </text>
        {log.remarks.slice(0, 6).map((r, i) => {
          const x = GRID_LEFT + r.time_hour * HOUR_W;
          const y = GRID_TOP + ROW_H * 4 + 30 + (i % 3) * 18;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={GRID_TOP + ROW_H * 4}
                x2={x}
                y2={y - 4}
                stroke="#94a3b8"
                strokeDasharray="2,2"
                strokeWidth="0.6"
              />
              <text x={x + 3} y={y} fontSize="8.5" fill="#0f172a">
                {r.text.length > 38 ? r.text.slice(0, 36) + '…' : r.text}
              </text>
            </g>
          );
        })}

        <text x={10} y={SVG_H - 14} fontSize="9" fill="#475569">
          <tspan fontWeight="700">Carrier:</tspan> {trip.carrier_name || '—'}
          <tspan dx="10" fontWeight="700">Main office:</tspan>{' '}
          {trip.main_office_address || '—'}
        </text>
      </svg>
    </div>
  );
}

function HeaderField({
  x,
  y,
  label,
  value,
}: {
  x: number;
  y: number;
  label: string;
  value: string;
}) {
  return (
    <g>
      <text x={x} y={y} fontSize="8" fill="#64748b" fontWeight="600">
        {label}
      </text>
      <text x={x} y={y + 12} fontSize="11" fill="#0f172a" fontWeight="600">
        {value}
      </text>
    </g>
  );
}
