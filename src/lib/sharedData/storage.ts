import type { StoredSharedData, SharedCalculatorData, SharedDataEntry } from './types';

const STORAGE_KEY = 'boring-math-shared-data';
const CURRENT_VERSION = 1;

export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function createEmptyStorage(): StoredSharedData {
  return {
    version: CURRENT_VERSION,
    data: {},
    lastUpdated: Date.now(),
  };
}

export function readStoredData(): StoredSharedData | null {
  if (!isStorageAvailable()) return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredSharedData;

    if (parsed.version !== CURRENT_VERSION) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredData(data: StoredSharedData): boolean {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function saveField<K extends keyof SharedCalculatorData>(
  key: K,
  value: SharedCalculatorData[K],
  source: string,
  sourceName: string
): boolean {
  if (value === undefined || value === null) return false;

  const existing = readStoredData() || createEmptyStorage();

  // TS cannot match a generic key against the mapped entry type, so write through a plain record
  (existing.data as Record<string, SharedDataEntry<unknown>>)[key] = {
    value,
    source,
    sourceName,
    savedAt: Date.now(),
  };

  existing.lastUpdated = Date.now();

  return writeStoredData(existing);
}

export function saveFields(
  fields: Partial<SharedCalculatorData>,
  source: string,
  sourceName: string
): boolean {
  const existing = readStoredData() || createEmptyStorage();
  const now = Date.now();

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) {
      (existing.data as Record<string, SharedDataEntry<unknown>>)[key] = {
        value,
        source,
        sourceName,
        savedAt: now,
      };
    }
  }

  existing.lastUpdated = now;
  return writeStoredData(existing);
}

export function getField<K extends keyof SharedCalculatorData>(
  key: K
): SharedDataEntry<NonNullable<SharedCalculatorData[K]>> | undefined {
  const stored = readStoredData();
  if (!stored) return undefined;

  return stored.data[key] as SharedDataEntry<NonNullable<SharedCalculatorData[K]>> | undefined;
}

export function getFields<K extends keyof SharedCalculatorData>(
  keys: readonly K[]
): Partial<{ [P in K]: SharedDataEntry<NonNullable<SharedCalculatorData[P]>> }> {
  const stored = readStoredData();
  if (!stored) return {};

  const result: Partial<{
    [P in K]: SharedDataEntry<NonNullable<SharedCalculatorData[P]>>;
  }> = {};

  for (const key of keys) {
    const entry = stored.data[key];
    if (entry) {
      result[key] = entry as SharedDataEntry<NonNullable<SharedCalculatorData[K]>>;
    }
  }

  return result;
}

export function getFieldValues<K extends keyof SharedCalculatorData>(
  keys: readonly K[]
): Partial<Pick<SharedCalculatorData, K>> {
  const entries = getFields(keys);
  const result: Partial<Pick<SharedCalculatorData, K>> = {};

  for (const [key, entry] of Object.entries(entries) as [string, SharedDataEntry<unknown>][]) {
    if (entry) {
      (result as Record<string, unknown>)[key] = entry.value;
    }
  }

  return result;
}

export function clearAllData(): boolean {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function clearFields(keys: (keyof SharedCalculatorData)[]): boolean {
  const existing = readStoredData();
  if (!existing) return true;

  for (const key of keys) {
    delete existing.data[key];
  }

  existing.lastUpdated = Date.now();
  return writeStoredData(existing);
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
