import { describe, expect, it } from 'vitest';
import { calculators } from '@/lib/calculators';

describe('calculator registry guard (no-new-calculators rule)', () => {
  it('has exactly 181 entries', () => {
    expect(calculators.length, 'registry must stay pinned at 181 (no-new-calculators rule)').toBe(
      181
    );
  });
});
