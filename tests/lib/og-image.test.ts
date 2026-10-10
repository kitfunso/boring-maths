import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { calculators, slugOf } from '../../src/lib/calculators';
import { DEFAULT_OG_CARD, OG_COLORS, renderOgImage } from '../../src/lib/og-image';

describe('og image', () => {
  it('gives every registry calculator a distinct slug and a card colour', () => {
    const slugs = calculators.map(slugOf);
    expect(new Set(slugs).size).toBe(calculators.length);
    expect(slugs.every((slug) => /^[a-z0-9-]+$/.test(slug))).toBe(true);
    expect(calculators.every((calc) => OG_COLORS[calc.color])).toBe(true);
  });

  it('renders a 1200x630 WebP card', async () => {
    const image = await renderOgImage(DEFAULT_OG_CARD);
    const meta = await sharp(image).metadata();
    expect([meta.format, meta.width, meta.height]).toEqual(['webp', 1200, 630]);
  });
});
