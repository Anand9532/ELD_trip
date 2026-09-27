'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="h-20 w-20 rounded-2xl glass glow-accent flex items-center justify-center mb-6"
      >
        <Icon className="h-10 w-10 text-accent" />
      </motion.div>
      <h3 className="text-xl font-semibold text-text mb-2">{title}</h3>
      <p className="text-text-secondary max-w-md mb-6">{description}</p>
      {action}
    </motion.div>
  );
}
