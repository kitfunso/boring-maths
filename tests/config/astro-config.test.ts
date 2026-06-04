import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const astroConfigPath = resolve(__dirname, '../../astro.config.mjs');

describe('astro config', () => {
  it('keeps nested pages on extensionless directory output', () => {
    const astroConfig = readFileSync(astroConfigPath, 'utf-8');

    // Cloudflare serves directory output at the trailing-slash URL, so the
    // config is 'always' to keep canonical + sitemap aligned with what is served.
    expect(astroConfig).toContain("trailingSlash: 'always'");
    expect(astroConfig).toContain("format: 'directory'");
    expect(astroConfig).not.toContain("format: 'file'");
  });
});
