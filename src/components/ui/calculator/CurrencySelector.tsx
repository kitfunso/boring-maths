import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { CURRENCY_OPTIONS, type Currency } from '../../../lib/regions';

const STORAGE_KEY = 'boring-math-currency';

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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
  // Ref to the select element for direct DOM manipulation
  const selectRef = useRef<HTMLSelectElement>(null);

  // Keep refs to avoid stale closures in event handlers
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  // Update refs when props change
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

  // Force select DOM to match value prop (fixes hydration mismatch)
  useIsomorphicLayoutEffect(() => {
    if (selectRef.current && selectRef.current.value !== value) {
      selectRef.current.value = value;
    }
  }, [value]);

  // Sync with global currency preference
  const syncWithGlobal = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['USD', 'GBP', 'EUR'].includes(stored) && stored !== valueRef.current) {
      onChangeRef.current(stored as Currency);
    }
  };

  // Sync on mount (synchronously before paint)
  useIsomorphicLayoutEffect(() => {
    syncWithGlobal();
  }, []);

  // Re-sync on Astro View Transitions navigation
  useEffect(() => {
    const handlePageLoad = () => {
      // Small delay to ensure localStorage is updated
      setTimeout(syncWithGlobal, 0);
    };

    document.addEventListener('astro:page-load', handlePageLoad);
    return () => document.removeEventListener('astro:page-load', handlePageLoad);
  }, []);

  // Listen for changes from other calculators/homepage
  useEffect(() => {
    const handler = (e: CustomEvent<{ currency: Currency }>) => {
      const newCurrency = e.detail.currency;
      if (newCurrency && newCurrency !== valueRef.current) {
        onChangeRef.current(newCurrency);
      }
    };

    window.addEventListener('currencyChange', handler as EventListener);
    return () => window.removeEventListener('currencyChange', handler as EventListener);
  }, []); // Stable handler using refs

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
      ref={selectRef}
      value={value}
      onChange={(e) => handleChange(e.currentTarget.value as Currency)}
      aria-label="Select currency"
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
