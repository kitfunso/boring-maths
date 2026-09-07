import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { getEmbedSnippet } from '../../src/lib/embeds';

describe('getEmbedSnippet', () => {
  it('puts the credit link in the host page, outside the noindex iframe', () => {
    const snippet = getEmbedSnippet('uk-tax-calculator');
    expect(snippet).toContain('<iframe src="https://boring-math.com/embed/uk-tax-calculator/"');
    const afterIframe = snippet.slice(snippet.indexOf('</iframe>'));
    expect(afterIframe).toContain('href="https://boring-math.com/calculators/uk-tax-calculator/"');
    expect(afterIframe).toContain('rel="nofollow noopener"');
  });

  it('titles the iframe with the real calculator name', () => {
    expect(getEmbedSnippet('uk-tax-calculator')).toContain('title="UK Tax Calculator"');
  });

  it('uses the trailing-slash form so hosts do not eat a 308 on every embed', () => {
    expect(getEmbedSnippet('bmi-calculator')).not.toMatch(/embed\/bmi-calculator"/);
  });
});

describe('_headers', () => {
  it('lets third-party sites frame /embed/*', () => {
    const headers = readFileSync('public/_headers', 'utf-8');
    const embedRule = headers.slice(headers.indexOf('/embed/*'));
    expect(headers).toContain('/embed/*');
    expect(embedRule).toContain('! X-Frame-Options');
  });
});
