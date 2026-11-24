// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import { calculators } from './src/lib/calculators.ts';

const NOINDEX_URLS = new Set(
  calculators.filter((c) => c.noindex).map((c) => `https://boring-math.com${c.href}`)
);

export default defineConfig({
  site: 'https://boring-math.com/',

  // Cloudflare Pages serves directory-format output at the trailing-slash URL
  // and 308-redirects the non-slash form, so we align canonical + sitemap to
  // 'always' to match what is actually served (avoids a canonical/served mismatch).
  trailingSlash: 'always',

  vite: {
    plugins: [tailwindcss()],
    build: {
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
      filter(page) {
        return !page.includes('/embed/') && !NOINDEX_URLS.has(page);
      },
      serialize(item) {
        if (item.url === 'https://boring-math.com/') {
          item.priority = 1.0;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else if (
          item.url.match(
            /\/calculators\/(automotive|brewing|business|engineering|events|everyday|finance|health|hobbies|home|income|uk-tax|us-tax)\/?$/
          )
        ) {
          item.priority = 0.9;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else if (item.url.includes('/calculators/')) {
          item.priority = 0.8;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        } else {
          item.priority = 0.5;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        }
        return item;
      },
    }),
  ],

  // /privacy redirects at the edge (public/_redirects): an Astro redirect stub carries robots noindex, which GSC flagged.
  build: {
    format: 'directory',
  },

  output: 'static',

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
