import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { GUIDES, guideBreadcrumbSchema } from '@/lib/guides';

// A guide page missing from the registry gets no hub link and no breadcrumb schema.
const GUIDES_DIR = path.resolve(__dirname, '..', '..', 'src', 'pages', 'guides');

describe('guides registry matches the guide pages', () => {
  const pageSlugs = fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith('.astro') && f !== 'index.astro')
    .map((f) => f.replace('.astro', ''));

  it('lists every guide page exactly once', () => {
    expect(GUIDES.map((g) => g.slug).sort()).toEqual(pageSlugs.sort());
  });

  it('uses the same name as the visible breadcrumb on each guide page', () => {
    for (const guide of GUIDES) {
      const source = fs.readFileSync(path.join(GUIDES_DIR, `${guide.slug}.astro`), 'utf8');
      const label = source.match(/<a href="\/guides\/">Guides<\/a>\s*›\s*([\s\S]*?)<\/nav>/)?.[1];
      expect(label?.replace(/\s+/g, ' ').trim(), guide.slug).toBe(guide.name);
    }
  });

  it('builds a three-step trail for a guide path and nothing for other paths', () => {
    const schema = guideBreadcrumbSchema('/guides/salary-sacrifice-uk-guide/');
    expect(schema?.itemListElement.map((i) => i.item)).toEqual([
      'https://boring-math.com/',
      'https://boring-math.com/guides/',
      'https://boring-math.com/guides/salary-sacrifice-uk-guide/',
    ]);
    expect(guideBreadcrumbSchema('/guides/')).toBeNull();
    expect(guideBreadcrumbSchema('/calculators/uk-tax-calculator/')).toBeNull();
  });
});
