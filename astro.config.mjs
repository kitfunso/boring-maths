// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://project-0-eight.vercel.app/', // Update this after Vercel deployment

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react(), sitemap()],

  output: 'static'
});