'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

const TRUCK_ANIMATION_SRC = '/truck-animation.json';

export function TruckAnimation() {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(TRUCK_ANIMATION_SRC)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-bg-primary overflow-hidden flex items-center justify-center">
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop
          autoplay
          aria-hidden
          className="h-full w-full scale-110"
          style={{ maxHeight: '100%' }}
          rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
        />
      ) : (
        <div className="h-full w-full animate-pulse bg-white/5" />
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,42,51,0.1) 0%, rgba(0,42,51,0.35) 100%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5 rounded-2xl" />
    </div>
  );
}
