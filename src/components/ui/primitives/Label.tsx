import type { LabelHTMLAttributes, ReactNode } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Label content */
  children: ReactNode;
  /** Show required asterisk */
  required?: boolean;
  /** Optional badge text (e.g., "Optional") */
  badge?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Form label component with optional required indicator and badge.
 *
 * @example
 * ```tsx
 * <Label htmlFor="salary" required>Annual Salary</Label>
 * <Label htmlFor="benefits" badge="Optional">Benefits Value</Label>
 * ```
 */
export function Label({
  children,
  required,
  badge,
  className = '',
  ...props
}: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
      {badge && (
        <span className="text-gray-400 font-normal ml-2">({badge})</span>
      )}
    </label>
  );
}
