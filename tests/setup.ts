/**
 * Vitest Setup File
 * Runs before each test file
 */

import { beforeEach, vi } from 'vitest';
// Extends expect with the jest-dom matchers and types them for Vitest
import '@testing-library/jest-dom/vitest';

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});
