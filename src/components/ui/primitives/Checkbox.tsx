import type { InputHTMLAttributes, ReactNode } from 'react';
import { useTheme } from '../theme/ThemeContext';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'checked'> {
  /** Controlled checked state */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Label text or element */
  label?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names for container */
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const LABEL_SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
};

/**
 * Themed checkbox component with optional label.
 *
 * @example
 * ```tsx
 * <Checkbox
 *   checked={includeOvertime}
 *   onChange={setIncludeOvertime}
 *   label="Include overtime pay"
 * />
 * ```
 */
export function Checkbox({
  checked,
  onChange,
  label,
  size = 'md',
  className = '',
  ...props
}: CheckboxProps) {
  const { tokens } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className={`
          ${SIZE_CLASSES[size]}
          rounded border-gray-300
          ${tokens.text600}
          focus:ring-2 focus:${tokens.ring100}
          cursor-pointer
        `}
        {...props}
      />
      {label && (
        <span className={`font-medium text-gray-700 ${LABEL_SIZE_CLASSES[size]}`}>
          {label}
        </span>
      )}
    </label>
  );
}
