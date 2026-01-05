import type { ReactNode } from 'react';
import { useTheme } from '../theme/ThemeContext';

export interface CalculatorHeaderProps {
  /** Main title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Right-side content (e.g., currency selector) */
  actions?: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Calculator header with gradient background and optional actions.
 *
 * @example
 * ```tsx
 * <CalculatorHeader
 *   title="Calculate Your Day Rate"
 *   subtitle="Enter your target salary to find your equivalent freelance rate"
 *   actions={<CurrencySelector value={currency} onChange={setCurrency} />}
 * />
 * ```
 */
export function CalculatorHeader({
  title,
  subtitle,
  actions,
  className = '',
}: CalculatorHeaderProps) {
  const { tokens } = useTheme();

  return (
    <div className={`${tokens.gradientHeader} px-6 py-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {subtitle && (
            <p className={`${tokens.text100} text-sm mt-1`}>{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
