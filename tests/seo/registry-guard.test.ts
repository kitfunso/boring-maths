import { describe, expect, it } from 'vitest';
import { calculators } from '@/lib/calculators';

describe('calculator registry guard (no-new-calculators rule)', () => {
  it('has exactly 169 entries', () => {
    // 168 -> 169 on 2026-07-28: UK Statutory Sick Pay added with Keith's
    // sign-off (UK admin activation plan), partially revoking the Jul-18
    // freeze by exactly one slot. Any further additions need fresh sign-off.
    expect(calculators.length, 'registry must stay pinned at 169 (no-new-calculators rule)').toBe(
      169
    );
  });
});
