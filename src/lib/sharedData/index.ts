/**
 * Shared Calculator Data Module
 *
 * Enables data sharing between calculators via localStorage.
 * Calculators can export values that other calculators can import.
 */

// Types
export type {
  SharedCalculatorData,
  SharedDataEntry,
  StoredSharedData,
  CalculatorDataConfig,
} from './types';

export { FIELD_LABELS } from './types';

// Storage utilities
export {
  isStorageAvailable,
  readStoredData,
  saveField,
  saveFields,
  getField,
  getFields,
  getFieldValues,
  clearAllData,
  clearFields,
  formatTimeAgo,
} from './storage';

// Context
export {
  SharedDataProvider,
  useSharedDataContext,
  useSharedDataContextSafe,
} from './SharedDataContext';

// Main hook
export { useSharedData } from './useSharedData';
export type {
  UseSharedDataOptions,
  UseSharedDataReturn,
  AvailableImport,
  ImportMapping,
  ExportMapping,
} from './useSharedData';

// Calculator configurations
export {
  CALCULATOR_CONFIGS,
  getCalculatorConfig,
  getConnectedCalculators,
} from './calculatorConfigs';
