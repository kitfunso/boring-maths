import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES = {
  default: 'bg-[var(--color-charcoal)] rounded-2xl',
  elevated:
    'bg-gradient-to-b from-[var(--color-slate)] to-[var(--color-charcoal)] rounded-2xl shadow-xl border border-white/5',
  bordered: 'bg-[var(--color-charcoal)] rounded-2xl border border-white/10',
};

const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  variant = 'elevated',
  padding = 'none',
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`${VARIANT_CLASSES[variant]} ${PADDING_CLASSES[padding]} overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
