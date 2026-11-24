import type { SelectHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeContext';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: string;
}

export interface SelectProps<T = string> extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange' | 'value' | 'size'
> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'header';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'py-3 text-base',
  md: 'py-3 text-lg',
  lg: 'py-4 text-xl',
};

export function Select<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}: SelectProps<T>) {
  const { tokens } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.currentTarget.value as T);
  };

  if (variant === 'header') {
    return (
      <select
        value={value as string}
        onChange={handleChange}
        className={`
          bg-[var(--color-charcoal)] text-[var(--color-cream)] border border-white/20
          rounded-xl px-4 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]/50
          cursor-pointer hover:bg-[var(--color-slate)] hover:border-white/30 transition-colors
          ${className}
        `}
        style={{ colorScheme: 'dark' }}
        {...props}
      >
        {options.map((option) => (
          <option
            key={String(option.value)}
            value={String(option.value)}
            className="bg-[var(--color-charcoal)] text-[var(--color-cream)]"
          >
            {option.icon ? `${option.icon} ${option.label}` : option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <select
      value={value as string}
      onChange={handleChange}
      className={`
        w-full px-4 border-2 border-white/10 rounded-xl
        bg-[var(--color-charcoal)] text-[var(--color-cream)]
        focus:${tokens.border500} focus:ring-4 ${tokens.ring100}
        transition-all duration-200 cursor-pointer
        ${SIZE_CLASSES[size]}
        ${className}
      `}
      style={{ colorScheme: 'dark' }}
      {...props}
    >
      {options.map((option) => (
        <option
          key={String(option.value)}
          value={String(option.value)}
          className="bg-[var(--color-charcoal)] text-[var(--color-cream)]"
        >
          {option.icon ? `${option.icon} ${option.label}` : option.label}
        </option>
      ))}
    </select>
  );
}
