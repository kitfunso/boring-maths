import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import type { SharedCalculatorData, SharedDataEntry, CalculatorDataConfig } from './types';

import { readStoredData, saveFields, getFields, isStorageAvailable } from './storage';

interface SharedDataContextValue {
  isAvailable: boolean;

  getAvailableImports: (config: CalculatorDataConfig) => Partial<{
    [K in keyof SharedCalculatorData]: SharedDataEntry<NonNullable<SharedCalculatorData[K]>>;
  }>;

  hasImportableData: (config: CalculatorDataConfig) => boolean;

  exportData: (config: CalculatorDataConfig, data: Partial<SharedCalculatorData>) => boolean;

  lastUpdated: number;

  refresh: () => void;
}

const SharedDataContext = createContext<SharedDataContextValue | null>(null);

export interface SharedDataProviderProps {
  children: ReactNode;
}

export function SharedDataProvider({ children }: SharedDataProviderProps) {
  const [lastUpdated, setLastUpdated] = useState<number>(() => {
    const stored = readStoredData();
    return stored?.lastUpdated ?? 0;
  });

  const isAvailable = useMemo(() => isStorageAvailable(), []);

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
    [isAvailable, getAvailableImports, hasImportableData, exportData, lastUpdated, refresh]
  );

  return <SharedDataContext.Provider value={value}>{children}</SharedDataContext.Provider>;
}

export function useSharedDataContext(): SharedDataContextValue {
  const context = useContext(SharedDataContext);
  if (!context) {
    throw new Error('useSharedDataContext must be used within a SharedDataProvider');
  }
  return context;
}

export function useSharedDataContextSafe(): SharedDataContextValue | null {
  return useContext(SharedDataContext);
}
