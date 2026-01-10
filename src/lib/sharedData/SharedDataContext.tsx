/**
 * Shared Data Context
 *
 * Provides a context for calculators to share data via localStorage.
 * Follows the same pattern as ThemeContext for consistency.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import type {
  SharedCalculatorData,
  SharedDataEntry,
  CalculatorDataConfig,
} from './types';

import {
  readStoredData,
  saveFields,
  getFields,
  isStorageAvailable,
} from './storage';

interface SharedDataContextValue {
  /** Whether localStorage is available */
  isAvailable: boolean;

  /** Get available data entries for a calculator's imports */
  getAvailableImports: (
    config: CalculatorDataConfig
  ) => Partial<{
    [K in keyof SharedCalculatorData]: SharedDataEntry<
      NonNullable<SharedCalculatorData[K]>
    >;
  }>;

  /** Check if any importable data exists for a calculator */
  hasImportableData: (config: CalculatorDataConfig) => boolean;

  /** Export data from a calculator */
  exportData: (
    config: CalculatorDataConfig,
    data: Partial<SharedCalculatorData>
  ) => boolean;

  /** Timestamp of last data update (for reactivity) */
  lastUpdated: number;

  /** Force refresh from storage */
  refresh: () => void;
}

const SharedDataContext = createContext<SharedDataContextValue | null>(null);

export interface SharedDataProviderProps {
  children: ReactNode;
}

/**
 * SharedDataProvider wraps the app to enable cross-calculator data sharing.
 *
 * @example
 * ```tsx
 * // In your layout or app root
 * <SharedDataProvider>
 *   <CalculatorLayout>
 *     <FreelanceDayRateCalculator />
 *   </CalculatorLayout>
 * </SharedDataProvider>
 * ```
 */
export function SharedDataProvider({ children }: SharedDataProviderProps) {
  const [lastUpdated, setLastUpdated] = useState<number>(() => {
    const stored = readStoredData();
    return stored?.lastUpdated ?? 0;
  });

  const isAvailable = useMemo(() => isStorageAvailable(), []);

  // Listen for storage changes from other tabs
  useEffect(() => {
    if (!isAvailable || typeof window === 'undefined') return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'boring-math-shared-data') {
        const stored = readStoredData();
        setLastUpdated(stored?.lastUpdated ?? Date.now());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isAvailable]);

  const getAvailableImports = useCallback(
    (config: CalculatorDataConfig) => {
      if (!isAvailable) return {};
      return getFields(config.imports);
    },
    [isAvailable]
  );

  const hasImportableData = useCallback(
    (config: CalculatorDataConfig) => {
      if (!isAvailable) return false;
      const imports = getFields(config.imports);
      return Object.keys(imports).length > 0;
    },
    [isAvailable]
  );

  const exportData = useCallback(
    (config: CalculatorDataConfig, data: Partial<SharedCalculatorData>) => {
      if (!isAvailable) return false;

      // Only save fields that are in the exports list
      const filteredData: Partial<SharedCalculatorData> = {};
      for (const key of config.exports) {
        if (data[key] !== undefined && data[key] !== null) {
          (filteredData as Record<string, unknown>)[key] = data[key];
        }
      }

      if (Object.keys(filteredData).length === 0) return false;

      const success = saveFields(filteredData, config.id, config.name);
      if (success) {
        setLastUpdated(Date.now());
      }
      return success;
    },
    [isAvailable]
  );

  const refresh = useCallback(() => {
    const stored = readStoredData();
    setLastUpdated(stored?.lastUpdated ?? Date.now());
  }, []);

  const value = useMemo<SharedDataContextValue>(
    () => ({
      isAvailable,
      getAvailableImports,
      hasImportableData,
      exportData,
      lastUpdated,
      refresh,
    }),
    [
      isAvailable,
      getAvailableImports,
      hasImportableData,
      exportData,
      lastUpdated,
      refresh,
    ]
  );

  return (
    <SharedDataContext.Provider value={value}>
      {children}
    </SharedDataContext.Provider>
  );
}

/**
 * Hook to access the shared data context.
 * Must be used within a SharedDataProvider.
 */
export function useSharedDataContext(): SharedDataContextValue {
  const context = useContext(SharedDataContext);
  if (!context) {
    throw new Error(
      'useSharedDataContext must be used within a SharedDataProvider'
    );
  }
  return context;
}

/**
 * Hook to check if shared data context is available (safe for optional use).
 * Returns null if not within a provider instead of throwing.
 */
export function useSharedDataContextSafe(): SharedDataContextValue | null {
  return useContext(SharedDataContext);
}
