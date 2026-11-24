import { useState, useCallback, useMemo } from 'react';
import { useSharedDataContextSafe } from './SharedDataContext';
import type { SharedCalculatorData, CalculatorDataConfig, SharedDataEntry } from './types';
import { FIELD_LABELS } from './types';
import { getFields, saveFields } from './storage';

export type ImportMapping<TInputs> = Partial<{
  [K in keyof SharedCalculatorData]: keyof TInputs;
}>;

export type ExportMapping<TInputs> = Partial<{
  [K in keyof TInputs]: keyof SharedCalculatorData;
}>;

export interface UseSharedDataOptions<TInputs> {
  config: CalculatorDataConfig;

  inputs: TInputs;

  setInputs: (inputs: TInputs | ((prev: TInputs) => TInputs)) => void;

  importMapping: ImportMapping<TInputs>;

  exportMapping: ExportMapping<TInputs>;

  getExportData?: () => Partial<SharedCalculatorData>;
}

export interface AvailableImport {
  sharedKey: keyof SharedCalculatorData;
  localKey: string;
  entry: SharedDataEntry<unknown>;
  friendlyLabel: string;
}

export interface UseSharedDataReturn {
  isAvailable: boolean;

  availableImports: AvailableImport[];

  showImportBanner: boolean;

  dismissImportBanner: () => void;

  importFields: (fields: (keyof SharedCalculatorData)[]) => void;

  importAll: () => void;

  exportData: () => boolean;

  justExported: boolean;
}

export function useSharedData<TInputs extends object>(
  options: UseSharedDataOptions<TInputs>
): UseSharedDataReturn {
  const { config, inputs, setInputs, importMapping, exportMapping, getExportData } = options;

  const context = useSharedDataContextSafe();

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [justExported, setJustExported] = useState(false);

  const availableImports = useMemo<AvailableImport[]>(() => {
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
    if (!config || !config.exports) {
      return false;
    }

    const dataToExport: Partial<SharedCalculatorData> = {};

    for (const [inputKey, sharedKey] of Object.entries(exportMapping)) {
      if (sharedKey) {
        const value = (inputs as Record<string, unknown>)[inputKey];
        if (value !== undefined && value !== null) {
          (dataToExport as Record<string, unknown>)[sharedKey as string] = value;
        }
      }
    }

    if (getExportData) {
      const extraData = getExportData();
      for (const [key, value] of Object.entries(extraData)) {
        if (value !== undefined && value !== null) {
          (dataToExport as Record<string, unknown>)[key] = value;
        }
      }
    }

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
      setTimeout(() => setJustExported(false), 2000);

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
