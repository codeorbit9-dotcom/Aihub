import React from 'react';
import { cn } from '../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="text-sm font-medium text-text-primary/70">{label}</label>}
      <input
        className={cn(
          'w-full rounded-xl border border-white/10 bg-card-bg px-4 py-2 text-text-primary outline-none transition-all focus:border-sky-blue/50 focus:ring-1 focus:ring-sky-blue/50',
          error && 'border-danger-red focus:border-danger-red focus:ring-danger-red',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-red">{error}</p>}
    </div>
  );
};
