/**
 * useSharedData Hook
 *
 * Main hook for calculators to integrate with the shared data system.
 * Handles import prompts, data mapping, and export tracking.
 */

import { useState, useCallback, useMemo } from 'react';
import { useSharedDataContextSafe } from './SharedDataContext';
import type { SharedCalculatorData, CalculatorDataConfig, SharedDataEntry } from './types';
import { FIELD_LABELS } from './types';
import { getFields, saveFields } from './storage';

/**
 * Mapping from shared data keys to calculator input keys
 */
export type ImportMapping<TInputs> = Partial<{
  [K in keyof SharedCalculatorData]: keyof TInputs;
}>;

/**
 * Mapping from calculator input keys to shared data keys
 */
export type ExportMapping<TInputs> = Partial<{
  [K in keyof TInputs]: keyof SharedCalculatorData;
}>;

export interface UseSharedDataOptions<TInputs> {
  /** Calculator configuration defining imports/exports */
  config: CalculatorDataConfig;

  /** Current calculator inputs */
  inputs: TInputs;

  /** Function to update calculator inputs */
  setInputs: (inputs: TInputs | ((prev: TInputs) => TInputs)) => void;

  /** Map shared data keys to calculator input keys */
  importMapping: ImportMapping<TInputs>;

  /** Map calculator input keys to shared data keys */
  exportMapping: ExportMapping<TInputs>;

  /** Optional: Additional data to export (e.g., from results) */
  getExportData?: () => Partial<SharedCalculatorData>;
}

export interface AvailableImport {
  sharedKey: keyof SharedCalculatorData;
  localKey: string;
  entry: SharedDataEntry<unknown>;
  friendlyLabel: string;
}

export interface UseSharedDataReturn {
  /** Whether shared data system is available */
  isAvailable: boolean;

  /** Data available for import with metadata */
  availableImports: AvailableImport[];

  /** Whether the import banner should be shown */
  showImportBanner: boolean;

  /** Dismiss the import banner for this session */
  dismissImportBanner: () => void;

  /** Import specific fields by their shared keys */
  importFields: (fields: (keyof SharedCalculatorData)[]) => void;

  /** Import all available fields */
  importAll: () => void;

  /** Export current data to shared storage */
  exportData: () => boolean;

  /** Whether data was just exported (for showing indicator) */
  justExported: boolean;
}

/**
 * Hook for integrating a calculator with the shared data system.
 *
 * @example
 * ```tsx
 * const sharedData = useSharedData({
 *   config: CALCULATOR_CONFIGS['emergency-fund'],
 *   inputs,
 *   setInputs,
 *   importMapping: {
 *     monthlyIncome: 'monthlyExpenses',
 *   },
 *   exportMapping: {
 *     monthlyExpenses: 'monthlyExpenses',
 *   },
 *   getExportData: () => ({
 *     emergencyFundTarget: result.targetAmount,
 *   }),
 * });
 * ```
 */
export function useSharedData<TInputs extends object>(
  options: UseSharedDataOptions<TInputs>
): UseSharedDataReturn {
  const { config, inputs, setInputs, importMapping, exportMapping, getExportData } = options;

  // Try to use context, fall back to direct storage if not available
  const context = useSharedDataContextSafe();

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [justExported, setJustExported] = useState(false);

  // Get available imports based on config and mapping
  const availableImports = useMemo<AvailableImport[]>(() => {
    // Handle missing config gracefully
    if (!config || !config.imports) {
      return [];
    }

    const imports = getFields(config.imports);
    const result: AvailableImport[] = [];

    for (const [sharedKey, entry] of Object.entries(imports)) {
      const localKey = importMapping[sharedKey as keyof SharedCalculatorData];
      if (localKey && entry) {
        result.push({
          sharedKey: sharedKey as keyof SharedCalculatorData,
          localKey: String(localKey),
          entry: entry as SharedDataEntry<unknown>,
          friendlyLabel: FIELD_LABELS[sharedKey as keyof SharedCalculatorData] || sharedKey,
        });
      }
    }

    return result;
  }, [config?.imports, importMapping, context?.lastUpdated]);

  const showImportBanner = !bannerDismissed && availableImports.length > 0;

  const dismissImportBanner = useCallback(() => {
    setBannerDismissed(true);
  }, []);

  const importFields = useCallback(
    (fields: (keyof SharedCalculatorData)[]) => {
      if (!config || !config.imports) return;

      const imports = getFields(config.imports);

      setInputs((prev) => {
        const updates: Partial<TInputs> = {};

        for (const field of fields) {
          const entry = imports[field];
          const localKey = importMapping[field];

          if (entry && localKey) {
            (updates as Record<string, unknown>)[localKey as string] = entry.value;
          }
        }

        return { ...prev, ...updates };
      });

      setBannerDismissed(true);
    },
    [config?.imports, importMapping, setInputs]
  );

  const importAll = useCallback(() => {
    const fields = availableImports.map((i) => i.sharedKey);
    importFields(fields);
  }, [availableImports, importFields]);

  const exportData = useCallback(() => {
    // Handle missing config gracefully
    if (!config || !config.exports) {
      return false;
    }

    const dataToExport: Partial<SharedCalculatorData> = {};

    // Export from inputs based on mapping
    for (const [inputKey, sharedKey] of Object.entries(exportMapping)) {
      if (sharedKey) {
        const value = (inputs as Record<string, unknown>)[inputKey];
        if (value !== undefined && value !== null) {
          (dataToExport as Record<string, unknown>)[sharedKey] = value;
        }
      }
    }

    // Export additional data from results
    if (getExportData) {
      const extraData = getExportData();
      for (const [key, value] of Object.entries(extraData)) {
        if (value !== undefined && value !== null) {
          (dataToExport as Record<string, unknown>)[key] = value;
        }
      }
    }

    // Only export fields that are in the config's exports list
    const filteredData: Partial<SharedCalculatorData> = {};
    for (const key of config.exports) {
      if (dataToExport[key] !== undefined) {
        (filteredData as Record<string, unknown>)[key] = dataToExport[key];
      }
    }

    if (Object.keys(filteredData).length === 0) return false;

    const success = saveFields(filteredData, config.id, config.name);

    if (success) {
      setJustExported(true);
      // Clear the indicator after 2 seconds
      setTimeout(() => setJustExported(false), 2000);

      // Notify context if available
      context?.refresh();
    }

    return success;
  }, [config, inputs, exportMapping, getExportData, context]);

  return {
    isAvailable: true, // Direct storage access always available
    availableImports,
    showImportBanner,
    dismissImportBanner,
    importFields,
    importAll,
    exportData,
    justExported,
  };
}
