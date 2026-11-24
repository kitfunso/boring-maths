import type { LabelHTMLAttributes, ReactNode } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
  badge?: string;
  className?: string;
}

export function Label({ children, required, badge, className = '', ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-[var(--color-cream)] mb-2 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      {badge && <span className="text-[var(--color-muted)] font-normal ml-2">({badge})</span>}
    </label>
  );
}
