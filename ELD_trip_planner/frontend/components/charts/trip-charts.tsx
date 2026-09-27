'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import type { Trip } from '@/types/trip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { computeTripMetrics } from '@/lib/utils';

import { chartColors, spotter } from '@/lib/theme';

export function TripCharts({ trip }: { trip: Trip }) {
  const metrics = computeTripMetrics(trip);

  const drivingByDay = trip.daily_logs.map((log) => ({
    date: log.log_date.slice(5),
    driving: log.totals.DRIVING || 0,
    onDuty: log.totals.ON_DUTY_NOT_DRIVING || 0,
    offDuty: log.totals.OFF_DUTY || 0,
    miles: log.total_miles,
  }));

  const dutyBreakdown = [
    { name: 'Driving', value: metrics.totalDriving, color: chartColors.driving },
    {
      name: 'On Duty',
      value: metrics.totalOnDuty,
      color: chartColors.onDuty,
    },
    {
      name: 'Off Duty',
      value: trip.events
        .filter((e) => e.status === 'OFF_DUTY')
        .reduce((a, e) => a + e.duration_hours, 0),
      color: chartColors.offDuty,
    },
  ].filter((d) => d.value > 0);

  const fuelStops = trip.events
    .filter((e) => e.type === 'FUEL')
    .map((e, i) => ({
      stop: `Stop ${i + 1}`,
      miles: trip.events
        .slice(0, trip.events.indexOf(e))
        .reduce((a, ev) => a + (ev.miles || 0), 0),
    }));

  const cycleData = [
    { name: 'Used', value: trip.current_cycle_used_hours + metrics.totalDriving + metrics.totalOnDuty },
    { name: 'Remaining', value: metrics.remainingCycle },
  ];

  const tooltipStyle = {
    backgroundColor: spotter.teal700,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#fff',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="Driving Hours by Day">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={drivingByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} />
            <YAxis stroke="#9CA3AF" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="driving" fill={chartColors.driving} radius={[6, 6, 0, 0]} animationDuration={1200} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Duty Status Breakdown">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={dutyBreakdown}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              animationDuration={1200}
            >
              {dutyBreakdown.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {dutyBreakdown.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
              {d.name}
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Cycle Usage (70h)">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={cycleData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              dataKey="value"
              animationDuration={1200}
            >
              <Cell fill={chartColors.cycle} />
              <Cell fill="rgba(255,255,255,0.08)" />
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Trip Progress">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={drivingByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} />
            <YAxis stroke="#9CA3AF" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="miles"
              stroke={chartColors.driving}
              fill="url(#milesGradient)"
              animationDuration={1200}
            />
            <defs>
              <linearGradient id="milesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.driving} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartColors.driving} stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {fuelStops.length > 0 && (
        <ChartCard title="Fuel Stops" className="md:col-span-2">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={fuelStops}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="stop" stroke="#9CA3AF" fontSize={11} />
              <YAxis stroke="#9CA3AF" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="miles" fill={chartColors.fuelBar} radius={[6, 6, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card glow hover className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
