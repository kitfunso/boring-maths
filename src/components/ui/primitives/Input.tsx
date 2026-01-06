import type { InputHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeContext';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input variant determines prefix/suffix styling */
  variant?: 'default' | 'currency' | 'percentage';
  /** Currency symbol for currency variant (e.g., "$", "£", "€") */
  currencySymbol?: string;
  /** Size of the input */
  size?: 'sm' | 'md' | 'lg';
  /** Error state */
  error?: boolean;
  /** Additional class names */
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'py-2 text-base',
  md: 'py-3 text-lg',
  lg: 'py-4 text-xl',
};

/**
 * Themed input component with support for currency and percentage variants.
 * Updated for dark theme.
 */
export function Input({
  variant = 'default',
  currencySymbol = '$',
  size = 'md',
  error = false,
  className = '',
  type = 'number',
  ...props
}: InputProps) {
  const { tokens } = useTheme();

  const baseClasses = `
    w-full border rounded-xl transition-all duration-200 tabular-nums
    bg-[var(--color-night)] text-[var(--color-cream)]
    placeholder:text-[var(--color-muted)]
    ${SIZE_CLASSES[size]}
    ${error
      ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20'
      : `border-white/10 focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/20`
    }
  `.trim().replace(/\s+/g, ' ');

  if (variant === 'currency') {
    return (
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] font-medium">
          {currencySymbol}
        </span>
        <input
          type={type}
          inputMode="numeric"
          className={`${baseClasses} pl-8 pr-4 ${className}`}
          {...props}
        />
      </div>
    );
  }

  if (variant === 'percentage') {
    return (
      <div className="relative">
        <input
          type={type}
          inputMode="decimal"
          className={`${baseClasses} pl-4 pr-10 ${className}`}
          {...props}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] font-medium">
          %
        </span>
      </div>
    );
  }

  // Default variant
  return (
    <input
      type={type}
      className={`${baseClasses} px-4 ${className}`}
      {...props}
    />
  );
}
