import { useState, useEffect } from 'preact/hooks';
import { CURRENCY_OPTIONS, type Currency } from '../../lib/regions';

const STORAGE_KEY = 'boring-math-currency';

/**
 * Standalone currency selector for the homepage.
 * Syncs with localStorage and broadcasts changes to all calculators.
 */
export default function HomepageCurrencySelector() {
  const [currency, setCurrency] = useState<Currency>('USD');

  // Load saved currency on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['USD', 'GBP', 'EUR'].includes(saved)) {
      setCurrency(saved as Currency);
    }
  }, []);

  const handleChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);

    // Broadcast to all calculators
    window.dispatchEvent(
      new CustomEvent('currencyChange', {
        detail: { currency: newCurrency },
      })
    );
  };

  return (
    <div className="flex items-center gap-2">
      <svg
        className="w-4 h-4 text-[var(--color-muted)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <select
        value={currency}
        onChange={(e) => handleChange(e.currentTarget.value as Currency)}
        className="
          bg-[var(--color-charcoal)] text-[var(--color-cream)] border border-white/10
          rounded-xl px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]/50
          cursor-pointer hover:bg-[var(--color-slate)] hover:border-white/20 transition-colors
        "
        style={{ colorScheme: 'dark' }}
        aria-label="Select currency"
      >
        {CURRENCY_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[var(--color-charcoal)] text-[var(--color-cream)]"
          >
            {option.flag} {option.value}
          </option>
        ))}
      </select>
    </div>
  );
}
