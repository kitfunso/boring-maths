import { createContext } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { type Currency, CURRENCIES } from '../../../lib/regions';

const STORAGE_KEY = 'boring-math-currency';
const DEFAULT_CURRENCY: Currency = 'USD';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  symbol: string;
  locale: string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * Global currency provider that persists selection to localStorage.
 * Wrap your app or calculator components with this provider.
 */
export function CurrencyProvider({ children }: { children: ComponentChildren }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['USD', 'GBP', 'EUR'].includes(stored)) {
      setCurrencyState(stored as Currency);
    }
    setIsHydrated(true);
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);

    window.dispatchEvent(
      new CustomEvent('currencyChange', {
        detail: { currency: newCurrency },
      })
    );
  };

  const config = CURRENCIES[currency];

  const value: CurrencyContextValue = {
    currency,
    setCurrency,
    symbol: config?.symbol || '$',
    locale: config?.locale || 'en-US',
  };

  if (!isHydrated) {
    return null;
  }

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: DEFAULT_CURRENCY,
      setCurrency: () => {},
      symbol: '$',
      locale: 'en-US',
    };
  }
  return context;
}

export function useCurrencySync(onCurrencyChange: (currency: Currency) => void) {
  useEffect(() => {
    const handler = (e: CustomEvent<{ currency: Currency }>) => {
      onCurrencyChange(e.detail.currency);
    };

    window.addEventListener('currencyChange', handler as EventListener);

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['USD', 'GBP', 'EUR'].includes(stored)) {
      onCurrencyChange(stored as Currency);
    }

    return () => {
      window.removeEventListener('currencyChange', handler as EventListener);
    };
  }, [onCurrencyChange]);
}

export { CurrencyContext };
