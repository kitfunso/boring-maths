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
 * Uses the header variant styling (white/transparent for gradient backgrounds).
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
        bg-white/10 text-white border border-white/30 rounded-lg px-3 py-2 text-sm
        focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer
        hover:bg-white/20 transition-colors
        ${className}
      `}
    >
      {CURRENCY_OPTIONS.map((option) => (
        <option key={option.value} value={option.value} className="text-gray-900">
          {option.flag} {option.label}
        </option>
      ))}
    </select>
  );
}
