'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="relative group">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'flex h-14 w-full rounded-xl bg-bg-secondary/80 border border-white/10 px-4 text-text text-base',
              'placeholder:text-text-secondary/50',
              'transition-all duration-200',
              'focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 focus:shadow-[0_0_20px_rgba(77,201,177,0.12)]',
              'hover:border-white/20',
              icon && 'pl-12',
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
