/**
 * Shared Data Storage Utilities
 *
 * Handles localStorage persistence with graceful fallbacks.
 */

import type { StoredSharedData, SharedCalculatorData, SharedDataEntry } from './types';

const STORAGE_KEY = 'boring-math-shared-data';
const CURRENT_VERSION = 1;

/**
 * Check if localStorage is available
 */
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

/**
 * Create empty storage structure
 */
function createEmptyStorage(): StoredSharedData {
  return {
    version: CURRENT_VERSION,
    data: {},
    lastUpdated: Date.now(),
  };
}

/**
 * Read stored data with validation
 */
export function readStoredData(): StoredSharedData | null {
  if (!isStorageAvailable()) return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredSharedData;

    // Version check - reset if outdated
    if (parsed.version !== CURRENT_VERSION) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Write data to storage
 */
export function writeStoredData(data: StoredSharedData): boolean {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/**
 * Save a single field with metadata
 */
export function saveField<K extends keyof SharedCalculatorData>(
  key: K,
  value: SharedCalculatorData[K],
  source: string,
  sourceName: string
): boolean {
  if (value === undefined || value === null) return false;

  const existing = readStoredData() || createEmptyStorage();

  existing.data[key] = {
    value,
    source,
    sourceName,
    savedAt: Date.now(),
  } as SharedDataEntry<NonNullable<SharedCalculatorData[K]>>;

  existing.lastUpdated = Date.now();

  return writeStoredData(existing);
}

/**
 * Save multiple fields at once
 */
export function saveFields(
  fields: Partial<SharedCalculatorData>,
  source: string,
  sourceName: string
): boolean {
  const existing = readStoredData() || createEmptyStorage();
  const now = Date.now();

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) {
      existing.data[key as keyof SharedCalculatorData] = {
        value,
        source,
        sourceName,
        savedAt: now,
      } as SharedDataEntry<NonNullable<SharedCalculatorData[keyof SharedCalculatorData]>>;
    }
  }

  existing.lastUpdated = now;
  return writeStoredData(existing);
}

/**
 * Get a single field entry with metadata
 */
export function getField<K extends keyof SharedCalculatorData>(
  key: K
): SharedDataEntry<NonNullable<SharedCalculatorData[K]>> | undefined {
  const stored = readStoredData();
  if (!stored) return undefined;

  return stored.data[key] as SharedDataEntry<NonNullable<SharedCalculatorData[K]>> | undefined;
}

/**
 * Get multiple fields with metadata
 */
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

/**
 * Get just the values (without metadata) for specified keys
 */
export function getFieldValues<K extends keyof SharedCalculatorData>(
  keys: readonly K[]
): Partial<Pick<SharedCalculatorData, K>> {
  const entries = getFields(keys);
  const result: Partial<Pick<SharedCalculatorData, K>> = {};

  for (const [key, entry] of Object.entries(entries)) {
    if (entry) {
      (result as Record<string, unknown>)[key] = entry.value;
    }
  }

  return result;
}

/**
 * Clear all shared data
 */
export function clearAllData(): boolean {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear specific fields
 */
export function clearFields(keys: (keyof SharedCalculatorData)[]): boolean {
  const existing = readStoredData();
  if (!existing) return true;

  for (const key of keys) {
    delete existing.data[key];
  }

  existing.lastUpdated = Date.now();
  return writeStoredData(existing);
}

/**
 * Format relative time for display
 */
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
