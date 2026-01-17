import { useEffect } from 'preact/hooks';
import { CURRENCY_OPTIONS, type Currency } from '../../../lib/regions';

const STORAGE_KEY = 'boring-math-currency';

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
 * Syncs with global currency preference stored in localStorage.
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
export function CurrencySelector({ value, onChange, className = '' }: CurrencySelectorProps) {
  // Sync with global currency on mount and listen for changes
  useEffect(() => {
    // Load initial value from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['USD', 'GBP', 'EUR'].includes(stored) && stored !== value) {
      onChange(stored as Currency);
    }

    // Listen for changes from other calculators
    const handler = (e: CustomEvent<{ currency: Currency }>) => {
      if (e.detail.currency !== value) {
        onChange(e.detail.currency);
      }
    };

    window.addEventListener('currencyChange', handler as EventListener);
    return () => window.removeEventListener('currencyChange', handler as EventListener);
  }, []);

  const handleChange = (newCurrency: Currency) => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, newCurrency);

    // Notify other calculators
    window.dispatchEvent(
      new CustomEvent('currencyChange', {
        detail: { currency: newCurrency },
      })
    );

    // Update local state
    onChange(newCurrency);
  };

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.currentTarget.value as Currency)}
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
