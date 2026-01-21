import { useId } from 'preact/hooks';
import { useTheme } from '../theme/ThemeContext';

export interface ButtonGroupOption<T = string> {
  value: T;
  label: string;
}

export interface ButtonGroupProps<T = string> {
  /** Options to display */
  options: ButtonGroupOption<T>[];
  /** Currently selected value */
  value: T;
  /** Change handler */
  onChange: (value: T) => void;
  /** Number of columns (default: auto based on options length) */
  columns?: 2 | 3 | 4;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label for the group */
  'aria-label'?: string;
  /** Additional class names */
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'py-2 px-2 text-xs sm:text-sm',
  md: 'py-2.5 px-2 text-xs sm:text-sm md:text-base',
  lg: 'py-3 px-3 text-sm sm:text-base md:text-lg',
};

const GRID_COLS = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

/**
 * Toggle button group for selecting one option from a set.
 *
 * @example
 * ```tsx
 * <ButtonGroup
 *   options={[
 *     { value: 'monthly', label: 'Monthly' },
 *     { value: 'biweekly', label: 'Bi-Weekly' },
 *     { value: 'weekly', label: 'Weekly' },
 *   ]}
 *   value={frequency}
 *   onChange={setFrequency}
 * />
 * ```
 */
export function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  columns,
  size = 'md',
  'aria-label': ariaLabel,
  className = '',
}: ButtonGroupProps<T>) {
  const { tokens } = useTheme();
  const groupId = useId();

  const cols = columns || ((options.length <= 4 ? options.length : 3) as 2 | 3 | 4);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = (index + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = (index - 1 + options.length) % options.length;
    }
    if (newIndex !== index) {
      onChange(options[newIndex].value);
      // Focus the new button
      const btn = document.getElementById(`${groupId}-${newIndex}`);
      btn?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`grid ${GRID_COLS[cols]} gap-3 ${className}`}
    >
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <button
            id={`${groupId}-${index}`}
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              ${SIZE_CLASSES[size]}
              rounded-xl border-2 font-medium transition-all
              ${
                isActive
                  ? `${tokens.border500} ${tokens.bg600} text-white`
                  : `border-white/10 bg-white/5 hover:bg-white/10 text-[var(--color-cream)]`
              }
            `
              .trim()
              .replace(/\s+/g, ' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
