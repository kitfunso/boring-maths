import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { CURRENCY_OPTIONS, type Currency } from '../../../lib/regions';

const STORAGE_KEY = 'boring-math-currency';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  className?: string;
}

export function CurrencySelector({ value, onChange, className = '' }: CurrencySelectorProps) {
  const selectRef = useRef<HTMLSelectElement>(null);

  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

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

  const syncWithGlobal = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['USD', 'GBP', 'EUR'].includes(stored) && stored !== valueRef.current) {
      onChangeRef.current(stored as Currency);
    }
  };

  useIsomorphicLayoutEffect(() => {
    syncWithGlobal();
  }, []);

  useEffect(() => {
    const handlePageLoad = () => {
      setTimeout(syncWithGlobal, 0);
    };

    document.addEventListener('astro:page-load', handlePageLoad);
    return () => document.removeEventListener('astro:page-load', handlePageLoad);
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent<{ currency: Currency }>) => {
      const newCurrency = e.detail.currency;
      if (newCurrency && newCurrency !== valueRef.current) {
        onChangeRef.current(newCurrency);
      }
    };

    window.addEventListener('currencyChange', handler as EventListener);
    return () => window.removeEventListener('currencyChange', handler as EventListener);
  }, []);

  const handleChange = (newCurrency: Currency) => {
    localStorage.setItem(STORAGE_KEY, newCurrency);

    window.dispatchEvent(
      new CustomEvent('currencyChange', {
        detail: { currency: newCurrency },
      })
    );

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
