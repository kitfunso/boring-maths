import { describe, expect, it } from 'vitest';
import { calculators } from '@/lib/calculators';

describe('calculator registry guard (no-new-calculators rule)', () => {
  it('has exactly 167 entries', () => {
    expect(calculators.length, 'registry must stay pinned at 167 (no-new-calculators rule)').toBe(
      167
    );
  });
});
