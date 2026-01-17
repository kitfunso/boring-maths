import type { InputHTMLAttributes } from 'react';

export interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type'
> {
  /** Current value */
  value: number | string;
  /** Change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Show spin controls */
  showControls?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'py-2 text-sm',
  md: 'py-3 text-lg',
  lg: 'py-4 text-xl',
};

/**
 * Modern number input with elegant spin controls (up/down arrows).
 * Features smooth hover animations and keyboard support.
 *
 * @example
 * ```tsx
 * <NumberInput
 *   value={amount}
 *   onChange={setAmount}
 *   min={0}
 *   max={100}
 *   step={5}
 * />
 * ```
 */
export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  showControls = true,
  size = 'md',
  className = '',
  disabled,
  ...props
}: NumberInputProps) {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;

  const increment = () => {
    const newValue = numValue + step;
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
  };

  const decrement = () => {
    const newValue = numValue - step;
    if (min === undefined || newValue >= min) {
      onChange(newValue);
    }
  };

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newValue = parseFloat(target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    } else if (target.value === '') {
      onChange(0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decrement();
    }
  };

  if (!showControls) {
    return (
      <input
        type="number"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`
          w-full px-4 border-2 border-white/10 rounded-xl
          bg-[var(--color-charcoal)] text-[var(--color-cream)]
          focus:border-[var(--color-accent)]/50 focus:ring-4 focus:ring-[var(--color-accent)]/10
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${SIZE_CLASSES[size]}
          ${className}
        `}
        {...props}
      />
    );
  }

  return (
    <div className="spin-input-wrapper w-full">
      <input
        type="number"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`
          w-full px-4 pr-10 border-2 border-white/10 rounded-xl
          bg-[var(--color-charcoal)] text-[var(--color-cream)]
          focus:border-[var(--color-accent)]/50 focus:ring-4 focus:ring-[var(--color-accent)]/10
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${SIZE_CLASSES[size]}
          ${className}
        `}
        {...props}
      />
      {!disabled && (
        <div className="spin-controls">
          <button
            type="button"
            onClick={increment}
            disabled={max !== undefined && numValue >= max}
            aria-label="Increase value"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={decrement}
            disabled={min !== undefined && numValue <= min}
            aria-label="Decrease value"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default NumberInput;
