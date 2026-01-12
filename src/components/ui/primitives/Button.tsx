import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Button content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'py-2 px-3 text-sm',
  md: 'py-3 px-4 text-base',
  lg: 'py-4 px-6 text-lg',
};

/**
 * Themed button component with multiple variants.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">Calculate</Button>
 * <Button variant="outline">Reset</Button>
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const { tokens } = useTheme();

  const baseClasses = `
    rounded-xl font-medium transition-all duration-200
    focus:outline-none focus:ring-4
    disabled:opacity-50 disabled:cursor-not-allowed
    ${SIZE_CLASSES[size]}
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: `
      ${tokens.bg600} text-white
      hover:${tokens.bg700}
      ${tokens.ring100}
    `,
    secondary: `
      ${tokens.bg50} ${tokens.text700}
      hover:${tokens.bg100}
      ${tokens.ring100}
    `,
    outline: `
      bg-transparent border-2 ${tokens.border200} ${tokens.text600}
      hover:${tokens.bg50}
      ${tokens.ring100}
    `,
    ghost: `
      bg-transparent ${tokens.text600}
      hover:${tokens.bg50}
      ${tokens.ring100}
    `,
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim().replace(/\s+/g, ' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size={size === 'lg' ? 'md' : 'sm'} variant="ring" />
          <span className="text-current opacity-80">Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
