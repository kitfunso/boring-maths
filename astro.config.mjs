// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://boring-maths.vercel.app/',

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Improve chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            'preact-vendor': ['preact', 'preact/hooks', 'preact/compat'],
          },
        },
      },
    },
  },

  integrations: [
    preact({ compat: true }), // Enable React compatibility
    sitemap(),
  ],

  output: 'static',

  // Prefetch links for faster navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});