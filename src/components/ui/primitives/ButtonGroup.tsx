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
  className = '',
}: ButtonGroupProps<T>) {
  const { tokens } = useTheme();

  const cols = columns || ((options.length <= 4 ? options.length : 3) as 2 | 3 | 4);

  return (
    <div className={`grid ${GRID_COLS[cols]} gap-3 ${className}`}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              ${SIZE_CLASSES[size]}
              rounded-xl border-2 font-medium transition-all
              ${
                isActive
                  ? `${tokens.border500} ${tokens.bg50} ${tokens.text700}`
                  : `border-white/10 hover:${tokens.border200} text-[var(--color-cream)]`
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
