import { describe, expect, it } from 'vitest';
import { calculators } from '@/lib/calculators';

describe('calculator registry guard (no-new-calculators rule)', () => {
  it('has exactly 170 entries', () => {
    // 168 -> 169 on 2026-07-28: UK Statutory Sick Pay added with Keith's
    // sign-off (UK admin activation plan), partially revoking the Jul-18
    // freeze by exactly one slot. Any further additions need fresh sign-off.
    // 169 -> 170 on 2026-08-08: UK Statutory Maternity Pay added.
    expect(calculators.length, 'registry must stay pinned at 170 (no-new-calculators rule)').toBe(
      170
    );
  });
});
