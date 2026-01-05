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
  default: 'text-gray-800',
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
};

/**
 * Secondary metric card for displaying individual values in grids.
 *
 * @example
 * ```tsx
 * <Grid responsive={{ sm: 2, md: 4 }} gap="md">
 *   <MetricCard label="Hourly Rate" value="$56.25" sublabel="8-hour day" />
 *   <MetricCard label="Weekly Rate" value="$2,250" />
 *   <MetricCard label="Total Saved" value="$45,000" valueColor="success" />
 * </Grid>
 * ```
 */
export function MetricCard({
  label,
  value,
  sublabel,
  valueColor = 'default',
  className = '',
}: MetricCardProps) {
  const { tokens } = useTheme();

  const valueColorClass = valueColor === 'themed'
    ? tokens.text700
    : VALUE_COLOR_CLASSES[valueColor];

  return (
    <div
      className={`
        bg-white border border-gray-200 rounded-xl p-4 text-center
        hover:${tokens.border200} hover:shadow-sm transition-all
        ${className}
      `}
    >
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-xl md:text-2xl font-bold tabular-nums ${valueColorClass}`}>
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
      )}
    </div>
  );
}
