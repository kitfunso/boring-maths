import type { ReactNode } from 'react';
import { useTheme } from '../theme/ThemeContext';

export interface ResultCardProps {
  label: string;
  value: string;
  subtitle?: string;
  footer?: ReactNode;
  size?: 'md' | 'lg';
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
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className={`text-sm font-semibold ${tokens.text600} uppercase tracking-wider mb-2`}>
        {label}
      </p>
      <p
        className={`${SIZE_CLASSES[size].value} font-bold ${tokens.text700} tabular-nums tracking-tight`}
      >
        {value}
      </p>
      {subtitle && <p className={`${tokens.text600} mt-2`}>{subtitle}</p>}
      {footer && (
        <div className={`mt-4 pt-4 border-t ${tokens.border200}`}>
          <div className={`text-sm ${tokens.text600}`}>{footer}</div>
        </div>
      )}
    </div>
  );
}
