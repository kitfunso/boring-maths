import { CURRENCY_OPTIONS, type Currency } from '../../../lib/regions';

export interface CurrencySelectorProps {
  /** Currently selected currency */
  value: Currency;
  /** Change handler */
  onChange: (currency: Currency) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Currency dropdown for calculator headers.
 * Dark themed styling for dark backgrounds.
 *
 * @example
 * ```tsx
 * <CalculatorHeader
 *   title="My Calculator"
 *   actions={
 *     <CurrencySelector
 *       value={inputs.currency}
 *       onChange={handleCurrencyChange}
 *     />
 *   }
 * />
 * ```
 */
export function CurrencySelector({
  value,
  onChange,
  className = '',
}: CurrencySelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Currency)}
      className={`
        bg-[var(--color-charcoal)] text-[var(--color-cream)] border border-white/20
        rounded-xl px-4 py-2 text-sm
        focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]/50
        cursor-pointer hover:bg-[var(--color-slate)] hover:border-white/30 transition-colors
        ${className}
      `}
      style={{ colorScheme: 'dark' }}
    >
      {CURRENCY_OPTIONS.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-[var(--color-charcoal)] text-[var(--color-cream)]"
        >
          {option.flag} {option.label}
        </option>
      ))}
    </select>
  );
}
