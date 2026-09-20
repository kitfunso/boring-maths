import { describe, expect, it } from 'vitest';
import { calculators } from '@/lib/calculators';

describe('calculator registry guard (no-new-calculators rule)', () => {
  it('has exactly 181 entries', () => {
    // Bumps need Keith's sign-off: 168->169 (Stat Sick Pay), 169->170 (Stat
    // Maternity Pay), 170->171 on 2026-09-02 (Card Rewards & Perks), 171->181
    // on 2026-09-20 (Singapore cluster, Keith's direction).
    expect(calculators.length, 'registry must stay pinned at 181 (no-new-calculators rule)').toBe(
      181
    );
  });
});
