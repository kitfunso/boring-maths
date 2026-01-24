import { useTheme } from '../theme/ThemeContext';

export interface MetricCardProps {
  /** Label text */
  label: string;
  /** Main value */
  value: string;
  /** Sublabel text */
  sublabel?: string;
  /** Value color variant */
  valueColor?: 'default' | 'success' | 'error' | 'warning' | 'themed';
  /** Additional class names */
  className?: string;
}

const VALUE_COLOR_CLASSES = {
  default: 'text-[var(--color-cream)]',
  success: 'text-emerald-400',
  error: 'text-rose-400',
  warning: 'text-amber-400',
};

/**
 * Secondary metric card for displaying individual values in grids.
 * Updated for dark theme.
 */
export function MetricCard({
  label,
  value,
  sublabel,
  valueColor = 'default',
  className = '',
}: MetricCardProps) {
  const { tokens } = useTheme();

  const valueColorClass =
    valueColor === 'themed' ? tokens.text700 : VALUE_COLOR_CLASSES[valueColor];

  return (
    <div
      className={`
        bg-[var(--color-night)] border border-white/10 rounded-xl p-4 text-center
        hover:border-white/20 transition-all
        ${className}
      `}
      role="group"
      aria-label={label}
    >
      <p
        className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-1"
        aria-hidden="true"
      >
        {label}
      </p>
      <p className={`text-xl md:text-2xl font-bold tabular-nums ${valueColorClass}`}>{value}</p>
      {sublabel && <p className="text-xs text-[var(--color-muted)] mt-1">{sublabel}</p>}
    </div>
  );
}
