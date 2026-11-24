import type { ReactNode } from 'react';
import { useTheme } from '../theme/ThemeContext';

export interface CalculatorHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function CalculatorHeader({
  title,
  subtitle,
  actions,
  className = '',
}: CalculatorHeaderProps) {
  const { tokens } = useTheme();

  const gradientClass = tokens?.gradientHeader ?? 'bg-gradient-to-r from-blue-600 to-blue-500';
  const textClass = tokens?.text100 ?? 'text-white/80';

  return (
    <div className={`${gradientClass} px-6 py-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {subtitle && <p className={`${textClass} text-sm mt-1`}>{subtitle}</p>}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
