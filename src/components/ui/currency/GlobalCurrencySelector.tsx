import { CURRENCY_OPTIONS } from '../../../lib/regions';
import { useCurrency } from './CurrencyContext';

export interface GlobalCurrencySelectorProps {
  /** Additional class names */
  className?: string;
}

/**
 * Global currency selector that syncs across all calculators.
 * Uses the CurrencyContext to persist selection.
 */
export function GlobalCurrencySelector({ className = '' }: GlobalCurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.currentTarget.value as typeof currency)}
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
