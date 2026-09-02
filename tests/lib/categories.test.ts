import { describe, expect, it } from 'vitest';
import { CATEGORY_COLORS, calculators, getCategories } from '@/lib/calculators';

describe('calculator categories', () => {
  const used = [...new Set(calculators.map((c) => c.category))];

  it('has a badge colour for every category in use', () => {
    // The homepage badge class list renders "undefined" for a missing key.
    const missing = used.filter((c) => !(c in CATEGORY_COLORS));
    expect(missing).toEqual([]);
  });

  it('lists All plus every used category exactly once', () => {
    const cats = getCategories();
    expect(cats[0]).toBe('All');
    expect(new Set(cats).size).toBe(cats.length);
    expect([...cats].sort()).toEqual(['All', ...used].sort());
  });

  it('has the Avios finder as the only Avios calculator', () => {
    const avios = calculators.filter((c) => c.category === 'Avios');
    expect(avios.map((c) => c.href)).toEqual(['/calculators/avios-destination-finder/']);
  });
});
