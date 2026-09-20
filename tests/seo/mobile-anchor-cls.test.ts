import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/* Anchor ad must reserve no height: a bar that paints tall then collapses on an
   unfilled slot shifts the viewport on every mobile load. */

const read = (...p: string[]) => fs.readFileSync(path.resolve(__dirname, '..', '..', ...p), 'utf8');

describe('mobile anchor ad reserves no height', () => {
  const css = read('src', 'styles', 'global.css');

  it('zeroes the anchor container min-height', () => {
    expect(css).toMatch(/\.mobile-anchor-ad \.ad-container\s*{[^}]*min-height:\s*0/);
  });

  it('out-specifies the AdUnit rule, which is inlined after this sheet', () => {
    expect(css).toMatch(/body \.mobile-anchor-ad \.ad-container\s*{/);
  });

  it('keeps the anchor out of the reserve-and-hold path', () => {
    const layout = read('src', 'layouts', 'CalculatorLayout.astro');
    const anchor = layout.slice(layout.indexOf('mobile-anchor-ad'));
    expect(anchor.slice(0, anchor.indexOf('/>'))).not.toMatch(/reserveHeight/);
  });
});
