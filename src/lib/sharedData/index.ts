export type {
  SharedCalculatorData,
  SharedDataEntry,
  StoredSharedData,
  CalculatorDataConfig,
} from './types';

export { FIELD_LABELS } from './types';

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

export {
  SharedDataProvider,
  useSharedDataContext,
  useSharedDataContextSafe,
} from './SharedDataContext';

export { useSharedData } from './useSharedData';
export type {
  UseSharedDataOptions,
  UseSharedDataReturn,
  AvailableImport,
  ImportMapping,
  ExportMapping,
} from './useSharedData';

export {
  CALCULATOR_CONFIGS,
  getCalculatorConfig,
  getConnectedCalculators,
} from './calculatorConfigs';
