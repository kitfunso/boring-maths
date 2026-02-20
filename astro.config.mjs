// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://boring-math.com/',

  // Consistent trailing slash handling for better SEO
  trailingSlash: 'never',

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
    sitemap({
      serialize(item) {
        // Set priority based on page depth
        if (item.url === 'https://boring-math.com/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (item.url.match(/\/calculators\/[a-z-]+\/$/)) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/calculators/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else {
          item.priority = 0.5;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
  ],

  redirects: {
    '/privacy': '/privacy-policy',
  },

  output: 'static',

  // Prefetch links for faster navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});