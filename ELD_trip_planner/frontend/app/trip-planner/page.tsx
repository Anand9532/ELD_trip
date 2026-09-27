import { TripPlannerWizard } from '@/components/trip/trip-planner-wizard';

export default function TripPlannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text">Trip Planner</h1>
        <p className="text-text-secondary mt-1">
          Configure your route and generate FMCSA-compliant ELD logs.
        </p>
      </div>
      <TripPlannerWizard />
    </div>
  );
}
