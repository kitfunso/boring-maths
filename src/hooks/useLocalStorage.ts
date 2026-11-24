import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { type Currency, getInitialCurrency } from '../lib/regions';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const getInitialValue = (): T => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    }

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as T;
        const defaultsValue =
          typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;

        const merged =
          isPlainObject(defaultsValue) && isPlainObject(parsed)
            ? { ...defaultsValue, ...parsed }
            : parsed;

        if (merged && typeof merged === 'object' && 'currency' in merged) {
          const globalCurrency = getInitialCurrency();
          const savedCurrency = (merged as { currency: Currency }).currency;

          if (globalCurrency !== savedCurrency) {
            return { ...merged, currency: globalCurrency };
          }
        }

        return merged;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }

    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  };

  const [state, setState] = useState<T>(getInitialValue);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncCurrency = () => {
      const currentState = stateRef.current;
      if (currentState && typeof currentState === 'object' && 'currency' in currentState) {
        const globalCurrency = getInitialCurrency();
        const currentCurrency = (currentState as { currency: Currency }).currency;

        if (globalCurrency !== currentCurrency) {
          setState((prev) => ({ ...prev, currency: globalCurrency }) as T);
        }
      }
    };

    document.addEventListener('astro:page-load', syncCurrency);

    syncCurrency();

    return () => {
      document.removeEventListener('astro:page-load', syncCurrency);
    };
  }, [key]);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, state]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        if (e.newValue === null) {
          const initial =
            typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
          setState(initial);
          return;
        }

        try {
          const parsed = JSON.parse(e.newValue);
          const defaultsValue =
            typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;

          const merged =
            isPlainObject(defaultsValue) && isPlainObject(parsed)
              ? { ...defaultsValue, ...parsed }
              : parsed;

          setState(merged);
        } catch {
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  const clear = useCallback(() => {
    const initial = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    setState(initial);
    try {
      localStorage.removeItem(key);
    } catch {
    }
  }, [key, initialValue]);

  return [state, setState, clear];
}

export default useLocalStorage;
