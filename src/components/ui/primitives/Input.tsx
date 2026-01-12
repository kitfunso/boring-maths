import type { InputHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { useRef } from 'preact/hooks';

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
 * Custom spin controls component for number inputs
 */
function SpinControls({
  inputRef,
  disabled,
  min,
  max,
  step = 1,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}) {
  const stepNum = typeof step === 'string' ? parseFloat(step) : step;

  const increment = () => {
    if (!inputRef.current || disabled) return;
    const currentValue = parseFloat(inputRef.current.value) || 0;
    const newValue = currentValue + stepNum;
    if (max === undefined || newValue <= max) {
      inputRef.current.value = String(newValue);
      inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const decrement = () => {
    if (!inputRef.current || disabled) return;
    const currentValue = parseFloat(inputRef.current.value) || 0;
    const newValue = currentValue - stepNum;
    if (min === undefined || newValue >= min) {
      inputRef.current.value = String(newValue);
      inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  if (disabled) return null;

  return (
    <div className="spin-controls">
      <button
        type="button"
        onClick={increment}
        tabIndex={-1}
        aria-label="Increase value"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={decrement}
        tabIndex={-1}
        aria-label="Decrease value"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Themed input component with support for currency and percentage variants.
 * Updated for dark theme with custom spin controls.
 */
export function Input({
  variant = 'default',
  currencySymbol = '$',
  size = 'md',
  error = false,
  className = '',
  type = 'number',
  disabled,
  min,
  max,
  step,
  ...props
}: InputProps) {
  const { tokens } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const isNumber = type === 'number';

  const baseClasses = `
    w-full border rounded-[10px] transition-all duration-200 tabular-nums
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
      <div className="spin-input-wrapper w-full">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] font-medium z-10"
          aria-hidden="true"
        >
          {currencySymbol}
        </span>
        <input
          ref={inputRef}
          type={type}
          inputMode="numeric"
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`${baseClasses} pl-8 pr-10 ${className}`}
          {...props}
        />
        {isNumber && (
          <SpinControls
            inputRef={inputRef}
            disabled={disabled}
            min={typeof min === 'number' ? min : undefined}
            max={typeof max === 'number' ? max : undefined}
            step={typeof step === 'number' ? step : 1}
          />
        )}
      </div>
    );
  }

  if (variant === 'percentage') {
    return (
      <div className="spin-input-wrapper w-full">
        <input
          ref={inputRef}
          type={type}
          inputMode="decimal"
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`${baseClasses} pl-4 pr-16 ${className}`}
          {...props}
        />
        <span
          className="absolute right-10 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] font-medium pointer-events-none"
          aria-hidden="true"
        >
          %
        </span>
        {isNumber && (
          <SpinControls
            inputRef={inputRef}
            disabled={disabled}
            min={typeof min === 'number' ? min : undefined}
            max={typeof max === 'number' ? max : undefined}
            step={typeof step === 'number' ? step : 1}
          />
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="spin-input-wrapper w-full">
      <input
        ref={inputRef}
        type={type}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`${baseClasses} px-4 pr-10 ${className}`}
        {...props}
      />
      {isNumber && (
        <SpinControls
          inputRef={inputRef}
          disabled={disabled}
          min={typeof min === 'number' ? min : undefined}
          max={typeof max === 'number' ? max : undefined}
          step={typeof step === 'number' ? step : 1}
        />
      )}
    </div>
  );
}
