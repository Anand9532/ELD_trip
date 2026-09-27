'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Flag, Gauge, CheckCircle2, Loader2 } from 'lucide-react';
import { useWizardStore } from '@/store';
import { usePlanTrip } from '@/hooks/use-plan-trip';
import { Input } from '@/components/ui/input';
import { LocationAutocomplete } from '@/components/trip/location-autocomplete';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const STEPS = [
  { title: 'Current Location', icon: MapPin, field: 'current_location' as const },
  { title: 'Pickup Location', icon: Navigation, field: 'pickup_location' as const },
  { title: 'Dropoff Location', icon: Flag, field: 'dropoff_location' as const },
  { title: 'Cycle Hours Used', icon: Gauge, field: 'current_cycle_used_hours' as const },
  { title: 'Review & Generate', icon: CheckCircle2, field: null },
];

export function TripPlannerWizard() {
  const { step, form, nextStep, prevStep, updateForm } = useWizardStore();
  const planTrip = usePlanTrip();
  const router = useRouter();

  const canContinue = () => {
    if (step === 0) return form.current_location.trim().length > 0;
    if (step === 1) return form.pickup_location.trim().length > 0;
    if (step === 2) return form.dropoff_location.trim().length > 0;
    if (step === 3) return form.current_cycle_used_hours >= 0;
    return true;
  };

  const handleContinue = () => {
    if (!canContinue()) return;
    nextStep();
  };

  const handleGenerate = async () => {
    if (
      !form.current_location.trim() ||
      !form.pickup_location.trim() ||
      !form.dropoff_location.trim()
    ) {
      return;
    }
    await planTrip.mutateAsync(form);
    router.push('/route-analysis');
  };

  const currentStep = STEPS[step];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <motion.div
                className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${
                  done
                    ? 'bg-accent/20 border-accent/40 text-accent'
                    : active
                      ? 'bg-accent/10 border-accent/30 text-accent glow-accent'
                      : 'bg-white/5 border-white/10 text-text-secondary'
                }`}
                animate={active ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: active ? Infinity : 0 }}
              >
                <Icon className="h-4 w-4" />
              </motion.div>
              <span
                className={`text-[10px] font-medium hidden sm:block ${
                  active ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      <Card glow className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {step < 4 ? (
              <>
                <h2 className="text-2xl font-bold text-text mb-2">{currentStep.title}</h2>
                <p className="text-text-secondary mb-6">
                  Enter the {currentStep.title.toLowerCase()} for your trip.
                </p>
                {currentStep.field === 'current_cycle_used_hours' ? (
                  <Input
                    label="Current cycle used (hours)"
                    type="number"
                    step="0.25"
                    min="0"
                    max="70"
                    value={form.current_cycle_used_hours}
                    onChange={(e) =>
                      updateForm('current_cycle_used_hours', parseFloat(e.target.value) || 0)
                    }
                    icon={<Gauge className="h-5 w-5" />}
                  />
                ) : currentStep.field ? (
                  <LocationAutocomplete
                    label={currentStep.title}
                    value={form[currentStep.field] as string}
                    onChange={(v) => updateForm(currentStep.field!, v)}
                    placeholder="Start typing a city…"
                    icon={<currentStep.icon className="h-5 w-5" />}
                  />
                ) : null}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-text mb-2">Review & Generate</h2>
                <p className="text-text-secondary mb-6">
                  Confirm your trip details before generating the route and ELD logs.
                </p>
                <div className="space-y-3 glass rounded-xl p-4">
                  <ReviewRow label="Current" value={form.current_location} />
                  <ReviewRow label="Pickup" value={form.pickup_location} />
                  <ReviewRow label="Dropoff" value={form.dropoff_location} />
                  <ReviewRow label="Cycle used" value={`${form.current_cycle_used_hours}h`} />
                  {form.driver_name && <ReviewRow label="Driver" value={form.driver_name} />}
                  {form.carrier_name && <ReviewRow label="Carrier" value={form.carrier_name} />}
                </div>

                <details className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-text-secondary">
                    Optional log header info
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <Input
                      label="Driver name"
                      value={form.driver_name || ''}
                      onChange={(e) => updateForm('driver_name', e.target.value)}
                    />
                    <Input
                      label="Co-driver name"
                      value={form.co_driver_name || ''}
                      onChange={(e) => updateForm('co_driver_name', e.target.value)}
                    />
                    <Input
                      label="Carrier name"
                      value={form.carrier_name || ''}
                      onChange={(e) => updateForm('carrier_name', e.target.value)}
                    />
                    <Input
                      label="Main office address"
                      value={form.main_office_address || ''}
                      onChange={(e) => updateForm('main_office_address', e.target.value)}
                    />
                    <Input
                      label="Truck number"
                      value={form.truck_number || ''}
                      onChange={(e) => updateForm('truck_number', e.target.value)}
                    />
                    <Input
                      label="Trailer number"
                      value={form.trailer_number || ''}
                      onChange={(e) => updateForm('trailer_number', e.target.value)}
                    />
                  </div>
                </details>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-6 border-t border-white/8">
          <Button variant="secondary" onClick={prevStep} disabled={step === 0}>
            Back
          </Button>
          {step < 4 ? (
            <Button onClick={handleContinue} disabled={!canContinue()}>
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={
                planTrip.isPending ||
                !form.current_location.trim() ||
                !form.pickup_location.trim() ||
                !form.dropoff_location.trim()
              }
            >
              {planTrip.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Route & Logs'
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-text-secondary text-sm">{label}</span>
      <span className="text-text font-medium text-sm">{value}</span>
    </div>
  );
}
