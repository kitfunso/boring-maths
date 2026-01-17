/**
 * useLocalStorage Hook
 *
 * Persists state to localStorage and syncs across tabs.
 * Perfect for saving calculator inputs so users don't lose their work.
 */

import { useState, useEffect, useCallback } from 'preact/hooks';

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
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }

    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  };

  const [state, setState] = useState<T>(getInitialValue);

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
