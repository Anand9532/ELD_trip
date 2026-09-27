'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  FileImage,
} from 'lucide-react';
import type { Trip } from '@/types/trip';
import { DailyLogSheet } from './daily-log-sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { computeTripMetrics, fmtHours, fmtMiles } from '@/lib/utils';
import { toast } from 'sonner';

export function EldLogViewer({ trip }: { trip: Trip }) {
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const logs = trip.daily_logs;
  const metrics = computeTripMetrics(trip);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = async () => {
    const el = containerRef.current?.querySelector('.log-sheet') as HTMLElement;
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `eld-log-${logs[page].log_date}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Log sheet downloaded as PNG');
    } catch {
      toast.error('Failed to export PNG');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className={fullscreen ? 'xl:col-span-3' : 'xl:col-span-2'}>
        <Card glow className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/8 pb-4">
            <CardTitle>
              Log Sheet — {logs[page]?.log_date}
              <span className="text-text-secondary text-sm font-normal ml-2">
                ({page + 1} of {logs.length})
              </span>
            </CardTitle>
            <div className="flex items-center gap-2 no-print">
              <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-text-secondary w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setFullscreen(!fullscreen)}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownloadPng}>
                <FileImage className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div ref={containerRef} className="overflow-auto scrollbar-thin rounded-xl bg-bg-secondary/50 p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DailyLogSheet trip={trip} log={logs[page]} scale={zoom} />
                </motion.div>
              </AnimatePresence>
            </div>

            {logs.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4 no-print">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex gap-1">
                  {logs.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === page ? 'w-6 bg-accent' : 'w-2 bg-white/20'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === logs.length - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!fullscreen && (
        <div className="space-y-4">
          <Card glow>
            <CardHeader>
              <CardTitle>Trip Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <SummaryRow label="Route" value={`${trip.current_location} → ${trip.dropoff_location}`} />
              <SummaryRow label="Distance" value={fmtMiles(trip.total_distance_miles)} />
              <SummaryRow label="Driving time" value={fmtHours(metrics.totalDriving)} />
              <SummaryRow label="Total trip time" value={fmtHours(metrics.totalTrip)} />
              <SummaryRow label="Fuel stops" value={String(metrics.fuelStops)} />
              <SummaryRow label="Log sheets" value={String(metrics.logSheets)} />
              <SummaryRow label="Driver" value={trip.driver_name || '—'} />
              <SummaryRow label="Carrier" value={trip.carrier_name || '—'} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text font-medium text-right">{value}</span>
    </div>
  );
}
