'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

/** Deterministic pseudo-random — same output on server and client. */
function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const PARTICLE_COUNT = 30;

function buildParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: seeded(i, 1) * 100,
    y: seeded(i, 2) * 100,
    size: seeded(i, 3) * 2 + 1,
    duration: seeded(i, 4) * 10 + 10,
    delay: seeded(i, 5) * 5,
  }));
}

export function AnimatedBackground() {
  const particles = useMemo(() => buildParticles(), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 animated-grid opacity-40" />
      <motion.div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(77,201,177,0.1) 0%, transparent 70%)',
        }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(232,93,86,0.07) 0%, transparent 70%)',
        }}
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            y: [0, -30, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
