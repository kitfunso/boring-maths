/** CardPerksCalculator island - render smoke test plus the no-advice copy gate (RAO 2001 art. 36A). */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, fireEvent, within } from '@testing-library/preact';
import CardPerksCalculator from '../../src/components/calculators/CardPerksCalculator/CardPerksCalculator';
import { computeResults } from '../../src/components/calculators/CardPerksCalculator/calculations';
import { buildDefaultInputs } from '../../src/components/calculators/CardPerksCalculator/types';
import { DEFAULT_ASSUMPTIONS } from '../../src/components/calculators/CardPerksCalculator/data/pointValues';
import { CARDS } from '../../src/components/calculators/CardPerksCalculator/data/cards';

const FORBIDDEN_COPY = /best card|recommend|you should/i;

describe('CardPerksCalculator', () => {
  it('mounts and shows a heading', () => {
    const { getByText } = render(<CardPerksCalculator />);
    expect(getByText('Card Rewards & Perks Calculator')).toBeTruthy();
  });

  it('shows one table row per ranked card', () => {
    const expected = computeResults(buildDefaultInputs(DEFAULT_ASSUMPTIONS), CARDS).ranked.length;
    const { container } = render(<CardPerksCalculator />);
    const rows = container.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(expected);
  });

  it('changing a spend input changes a rendered net value', () => {
    const { container } = render(<CardPerksCalculator />);
    const before = container.querySelector('table tbody')?.textContent;
    const groceries = container.querySelector<HTMLInputElement>('#spend-groceries');
    expect(groceries).toBeTruthy();
    fireEvent.input(groceries as HTMLInputElement, { target: { value: '50000' } });
    const after = container.querySelector('table tbody')?.textContent;
    expect(after).not.toBe(before);
  });

  it('colours the headline net value red once the top card loses money', () => {
    const chargeOnly = { ...buildDefaultInputs(DEFAULT_ASSUMPTIONS), types: ['charge'] as const };
    const topNet = Math.max(
      ...computeResults(chargeOnly, CARDS).ranked.map((r) => r.breakdown.net)
    );
    expect(topNet).toBeLessThan(0);

    const { getByRole } = render(<CardPerksCalculator />);
    const headline = () =>
      getByRole('group', { name: 'Highest net value' }).querySelector('.tabular-nums');
    expect(headline()?.className).toContain('text-emerald-400');

    const chips = getByRole('group', { name: 'Filter by card type' });
    fireEvent.click(within(chips).getByRole('button', { name: 'Charge card' }));
    expect(headline()?.textContent).toContain('-');
    expect(headline()?.className).toContain('text-rose-400');
    expect(headline()?.className).not.toContain('text-emerald-400');
  });
});

describe('CardPerksCalculator copy gate', () => {
  it('the page and island never suggest a specific card or mention AffiliateBox', () => {
    const islandSource = readFileSync(
      'src/components/calculators/CardPerksCalculator/CardPerksCalculator.tsx',
      'utf-8'
    );
    const pageSource = readFileSync('src/pages/calculators/card-rewards-calculator.astro', 'utf-8');
    for (const source of [islandSource, pageSource]) {
      expect(source).not.toMatch(FORBIDDEN_COPY);
      expect(source).not.toContain('AffiliateBox');
    }
  });
});
