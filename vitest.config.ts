import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',

    globals: true,

    setupFiles: ['./tests/setup.ts'],

    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],

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
      '@': '/src',
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      'react/jsx-dev-runtime': 'preact/jsx-runtime',
    },
  },
});
