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
  /** Show spin controls for number inputs (default: true) */
  showControls?: boolean;
  /** Additional class names */
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'py-3 md:py-2 text-base',
  md: 'py-4 md:py-3 text-lg',
  lg: 'py-5 md:py-4 text-xl',
};

/**
 * Custom spin controls component for number inputs.
 * Supports disabled state on individual buttons when at min/max bounds.
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

  const getCurrentValue = (): number => {
    return parseFloat(inputRef.current?.value ?? '0') || 0;
  };

  const increment = () => {
    if (!inputRef.current || disabled) return;
    const currentValue = getCurrentValue();
    const newValue = currentValue + stepNum;
    if (max === undefined || newValue <= max) {
      inputRef.current.value = String(newValue);
      inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const decrement = () => {
    if (!inputRef.current || disabled) return;
    const currentValue = getCurrentValue();
    const newValue = currentValue - stepNum;
    if (min === undefined || newValue >= min) {
      inputRef.current.value = String(newValue);
      inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  if (disabled) return null;

  const currentValue = getCurrentValue();
  const isAtMax = max !== undefined && currentValue >= max;
  const isAtMin = min !== undefined && currentValue <= min;

  return (
    <div className="spin-controls">
      <button
        type="button"
        onClick={increment}
        tabIndex={-1}
        disabled={isAtMax}
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
        disabled={isAtMin}
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
 * Themed input component with support for currency, percentage, and number variants.
 * Includes custom spin controls with keyboard support for number inputs.
 *
 * @example
 * ```tsx
 * // Currency input
 * <Input variant="currency" currencySymbol="$" min={0} step={100} />
 *
 * // Percentage input
 * <Input variant="percentage" min={0} max={100} step={0.5} />
 *
 * // Number input without spin controls
 * <Input type="number" showControls={false} />
 *
 * // Text input
 * <Input type="text" placeholder="Enter name" />
 * ```
 */
export function Input({
  variant = 'default',
  currencySymbol = '$',
  size = 'md',
  error = false,
  showControls = true,
  className = '',
  type = 'number',
  disabled,
  min,
  max,
  step,
  ...props
}: InputProps) {
  useTheme(); // Theme context for potential future use
  const inputRef = useRef<HTMLInputElement>(null);
  const isNumber = type === 'number';
  const shouldShowControls = isNumber && showControls;

  const stepNum = typeof step === 'number' ? step : typeof step === 'string' ? parseFloat(step) : 1;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isNumber || !inputRef.current) return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentValue = parseFloat(inputRef.current.value) || 0;
      const newValue = currentValue + stepNum;
      if (max === undefined || newValue <= Number(max)) {
        inputRef.current.value = String(newValue);
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = parseFloat(inputRef.current.value) || 0;
      const newValue = currentValue - stepNum;
      if (min === undefined || newValue >= Number(min)) {
        inputRef.current.value = String(newValue);
        inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  const baseClasses = `
    w-full border rounded-[10px] transition-all duration-200 tabular-nums
    bg-[var(--color-night)] text-[var(--color-cream)]
    placeholder:text-[var(--color-muted)]
    ${SIZE_CLASSES[size]}
    ${
      error
        ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20'
        : `border-white/10 focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/20`
    }
  `
    .trim()
    .replace(/\s+/g, ' ');

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
          onKeyDown={handleKeyDown}
          className={`${baseClasses} pl-8 ${shouldShowControls ? 'pr-10' : 'pr-4'} ${className}`}
          {...props}
        />
        {shouldShowControls && (
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
          onKeyDown={handleKeyDown}
          className={`${baseClasses} pl-4 ${shouldShowControls ? 'pr-16' : 'pr-12'} ${className}`}
          {...props}
        />
        <span
          className="absolute right-10 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] font-medium pointer-events-none"
          aria-hidden="true"
        >
          %
        </span>
        {shouldShowControls && (
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
  if (shouldShowControls) {
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
          onKeyDown={handleKeyDown}
          className={`${baseClasses} px-4 pr-10 ${className}`}
          {...props}
        />
        <SpinControls
          inputRef={inputRef}
          disabled={disabled}
          min={typeof min === 'number' ? min : undefined}
          max={typeof max === 'number' ? max : undefined}
          step={typeof step === 'number' ? step : 1}
        />
      </div>
    );
  }

  // Default variant without spin controls (or text input)
  return (
    <input
      ref={inputRef}
      type={type}
      inputMode={isNumber ? 'decimal' : undefined}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      onKeyDown={isNumber ? handleKeyDown : undefined}
      className={`${baseClasses} px-4 ${className}`}
      {...props}
    />
  );
}
