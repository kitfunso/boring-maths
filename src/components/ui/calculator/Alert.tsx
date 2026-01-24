import type { ReactNode } from 'react';

export interface AlertProps {
  /** Alert variant determines icon and colors */
  variant?: 'info' | 'warning' | 'error' | 'success' | 'tip';
  /** Alert title (optional) */
  title?: string;
  /** Alert content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
}

const VARIANT_STYLES = {
  info: {
    container: 'bg-blue-950/30 border-blue-500/30',
    icon: 'text-blue-400',
    text: 'text-blue-200',
  },
  warning: {
    container: 'bg-amber-950/30 border-amber-500/30',
    icon: 'text-amber-400',
    text: 'text-amber-200',
  },
  error: {
    container: 'bg-rose-950/30 border-rose-500/30',
    icon: 'text-rose-400',
    text: 'text-rose-200',
  },
  success: {
    container: 'bg-emerald-950/30 border-emerald-500/30',
    icon: 'text-emerald-400',
    text: 'text-emerald-200',
  },
  tip: {
    container: 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30',
    icon: 'text-[var(--color-accent)]',
    text: 'text-[var(--color-cream)]',
  },
};

const VARIANT_ICONS = {
  info: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  success: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  tip: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  ),
};

/**
 * Alert component for displaying tips, warnings, and errors.
 * Updated for dark theme.
 */
export function Alert({ variant = 'info', title, children, className = '' }: AlertProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={`${styles.container} border rounded-xl p-4 flex gap-3 ${className}`}
      role="alert"
    >
      <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>{VARIANT_ICONS[variant]}</div>
      <div className={`text-sm ${styles.text}`}>
        {title && <strong>{title} </strong>}
        {children}
      </div>
    </div>
  );
}
