import type { ReactNode } from 'react';
import { useTheme } from '../theme/ThemeContext';

export interface ResultCardProps {
  /** Label above the value */
  label: string;
  /** Main displayed value */
  value: string;
  /** Subtitle below value */
  subtitle?: string;
  /** Additional info section (e.g., gross rate) */
  footer?: ReactNode;
  /** Size variant */
  size?: 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const SIZE_CLASSES = {
  md: {
    value: 'text-4xl md:text-5xl',
    padding: 'p-6',
  },
  lg: {
    value: 'text-5xl md:text-6xl',
    padding: 'p-6 md:p-8',
  },
};

/**
 * Primary result display card with gradient background.
 *
 * @example
 * ```tsx
 * <ResultCard
 *   label="Your Recommended Day Rate"
 *   value="$450"
 *   subtitle="After 30% tax"
 *   footer={
 *     <p>Gross rate (before tax): <strong>$643</strong></p>
 *   }
 * />
 * ```
 */
export function ResultCard({
  label,
  value,
  subtitle,
  footer,
  size = 'lg',
  className = '',
}: ResultCardProps) {
  const { tokens } = useTheme();

  return (
    <div
      className={`
        ${tokens.gradientResult} border-2 ${tokens.border200}
        rounded-2xl ${SIZE_CLASSES[size].padding} text-center
        ${className}
      `}
    >
      <p className={`text-sm font-semibold ${tokens.text600} uppercase tracking-wider mb-2`}>
        {label}
      </p>
      <p className={`${SIZE_CLASSES[size].value} font-bold ${tokens.text700} tabular-nums tracking-tight`}>
        {value}
      </p>
      {subtitle && (
        <p className={`${tokens.text600} mt-2`}>{subtitle}</p>
      )}
      {footer && (
        <div className={`mt-4 pt-4 border-t ${tokens.border200}`}>
          <div className={`text-sm ${tokens.text600}`}>{footer}</div>
        </div>
      )}
    </div>
  );
}
