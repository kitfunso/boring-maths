/**
 * useLocalStorage Hook
 *
 * Persists state to localStorage and syncs across tabs.
 * Perfect for saving calculator inputs so users don't lose their work.
 *
 * When loading saved state that has a 'currency' field, it will automatically
 * sync with the global currency preference from 'boring-math-currency'.
 */

import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { type Currency, getInitialCurrency } from '../lib/regions';

const CURRENCY_STORAGE_KEY = 'boring-math-currency';

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const getInitialValue = (): T => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as T;

        // If the saved state has a currency field, sync it with the global preference
        if (parsed && typeof parsed === 'object' && 'currency' in parsed) {
          const globalCurrency = getInitialCurrency();
          const savedCurrency = (parsed as { currency: Currency }).currency;

          // If global currency differs from saved, update the currency field
          // but keep all other saved values
          if (globalCurrency !== savedCurrency) {
            return { ...parsed, currency: globalCurrency };
          }
        }

        return parsed;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }

    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  };

  const [state, setState] = useState<T>(getInitialValue);

  // Keep a ref to current state for use in event handlers
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Re-sync currency on page navigation (for Astro View Transitions)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncCurrency = () => {
      const currentState = stateRef.current;
      // Only sync if state has a currency field
      if (currentState && typeof currentState === 'object' && 'currency' in currentState) {
        const globalCurrency = getInitialCurrency();
        const currentCurrency = (currentState as { currency: Currency }).currency;

        if (globalCurrency !== currentCurrency) {
          setState((prev) => ({ ...prev, currency: globalCurrency }) as T);
        }
      }
    };

    // Sync on Astro page load (View Transitions)
    document.addEventListener('astro:page-load', syncCurrency);

    // Also sync immediately in case we just navigated
    syncCurrency();

    return () => {
      document.removeEventListener('astro:page-load', syncCurrency);
    };
  }, [key]); // Only re-run if key changes

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, state]);

  // Listen for changes from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  // Clear function to reset to initial value
  const clear = useCallback(() => {
    const initial = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    setState(initial);
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  }, [key, initialValue]);

  return [state, setState, clear];
}

export default useLocalStorage;
