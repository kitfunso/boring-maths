import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom for DOM testing
    environment: 'jsdom',

    // Enable globals like describe, it, expect
    globals: true,

    // Setup files run before each test file
    setupFiles: ['./tests/setup.ts'],

    // Include test files
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/components/calculators/**/calculations.ts'],
      exclude: ['node_modules', 'tests'],
    },

    // Global test timeout
    testTimeout: 10000,
  },

  resolve: {
    alias: {
      // Match the project's import aliases if any
      '@': '/src',
    },
  },
});
