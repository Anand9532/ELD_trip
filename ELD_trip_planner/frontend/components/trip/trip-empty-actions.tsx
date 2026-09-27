import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface TripEmptyActionsProps {
  primaryLabel?: string;
  primaryHref?: string;
}

export function TripEmptyActions({
  primaryLabel = 'Plan a Trip',
  primaryHref = '/trip-planner',
}: TripEmptyActionsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Link href={primaryHref}>
        <Button>{primaryLabel}</Button>
      </Link>
      <Link href="/trips">
        <Button variant="secondary">View All Trips</Button>
      </Link>
    </div>
  );
}
