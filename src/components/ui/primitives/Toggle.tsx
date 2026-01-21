import { useId } from 'preact/hooks';
import { useTheme } from '../theme/ThemeContext';

export interface ToggleProps {
  /** Controlled checked state */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Label text */
  label: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible description (shown to screen readers) */
  description?: string;
  /** Additional class names for container */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

const SIZE_CLASSES = {
  sm: {
    track: 'w-9 h-5',
    thumb: 'w-4 h-4',
    translate: 'translate-x-4',
  },
  md: {
    track: 'w-12 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-6',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'translate-x-7',
  },
};

/**
 * Accessible toggle switch component.
 *
 * @example
 * ```tsx
 * <Toggle
 *   checked={includeInsurance}
 *   onChange={setIncludeInsurance}
 *   label="Include pet insurance"
 * />
 * ```
 */
export function Toggle({
  checked,
  onChange,
  label,
  size = 'md',
  description,
  className = '',
  disabled = false,
}: ToggleProps) {
  const { tokens } = useTheme();
  const id = useId();
  const toggleId = `toggle-${id}`;
  const descriptionId = description ? `toggle-desc-${id}` : undefined;

  const sizes = SIZE_CLASSES[size];

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={descriptionId}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          ${sizes.track} rounded-full transition-all relative flex-shrink-0
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-void)]
          ${checked ? `${tokens.bg500} focus:${tokens.ring500}` : 'bg-white/20 focus:ring-white/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `
          .trim()
          .replace(/\s+/g, ' ')}
      >
        <span
          aria-hidden="true"
          className={`
            ${sizes.thumb} rounded-full bg-white shadow-sm transition-transform
            absolute top-0.5 left-0.5
            ${checked ? sizes.translate : 'translate-x-0'}
          `
            .trim()
            .replace(/\s+/g, ' ')}
        />
      </button>
      <label
        htmlFor={toggleId}
        className={`text-[var(--color-cream)] ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
        onClick={handleClick}
      >
        {label}
      </label>
      {description && (
        <span id={descriptionId} className="sr-only">
          {description}
        </span>
      )}
    </div>
  );
}
