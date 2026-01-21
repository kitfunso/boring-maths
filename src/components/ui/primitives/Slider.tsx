import type { InputHTMLAttributes } from 'react';
import { useId } from 'preact/hooks';
import { useTheme } from '../theme/ThemeContext';

export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange' | 'value'
> {
  /** Current value */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment */
  step?: number;
  /** Labels for the slider */
  labels?: {
    /** Label for minimum value */
    min?: string;
    /** Label for middle value (optional) */
    mid?: string;
    /** Label for maximum value */
    max?: string;
    /** Current value formatter (displays above slider) */
    current?: string | ((value: number) => string);
  };
  /** Show value inline with label */
  showValue?: boolean;
  /** Label text */
  label?: string;
  /** Accessible name for screen readers (required if no label) */
  'aria-label'?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Range slider input with optional labels.
 *
 * @example
 * ```tsx
 * <Slider
 *   value={years}
 *   onChange={setYears}
 *   min={1}
 *   max={30}
 *   label="Time to Reach Goal"
 *   labels={{
 *     min: '1 year',
 *     mid: '15 years',
 *     max: '30 years',
 *   }}
 *   showValue
 * />
 * ```
 */
export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  labels,
  showValue = false,
  label,
  'aria-label': ariaLabel,
  className = '',
  ...props
}: SliderProps) {
  const { tokens } = useTheme();
  const id = useId();
  const sliderId = `slider-${id}`;
  const labelId = `slider-label-${id}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const currentLabel = labels?.current
    ? typeof labels.current === 'function'
      ? labels.current(value)
      : labels.current
    : `${value}`;

  return (
    <div className={className}>
      {label && (
        <label
          id={labelId}
          htmlFor={sliderId}
          className="block text-sm font-medium text-[var(--color-cream)] mb-2"
        >
          {label}
          {showValue && (
            <>
              : <span className={`font-semibold ${tokens.text600}`}>{currentLabel}</span>
            </>
          )}
        </label>
      )}
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        aria-labelledby={label ? labelId : undefined}
        aria-label={!label ? ariaLabel || `Value: ${currentLabel}` : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={currentLabel}
        className={`
          w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
          ${tokens.accent}
        `}
        {...props}
      />
      {(labels?.min || labels?.mid || labels?.max) && (
        <div
          className="flex justify-between text-sm text-[var(--color-muted)] mt-1"
          aria-hidden="true"
        >
          <span>{labels?.min || min}</span>
          {labels?.mid && <span>{labels.mid}</span>}
          <span>{labels?.max || max}</span>
        </div>
      )}
    </div>
  );
}
