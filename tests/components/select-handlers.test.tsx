/** Select hands onChange the option value, not an event; handlers that read e.target threw on every change. */

import { describe, it, expect } from 'vitest';
import { render, fireEvent, act } from '@testing-library/preact';
import CouncilTaxCalculator from '../../src/components/calculators/CouncilTaxCalculator/CouncilTaxCalculator';
import {
  calculateCouncilTax,
  formatCurrency,
} from '../../src/components/calculators/CouncilTaxCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/CouncilTaxCalculator/types';

// fireEvent.change is renamed to input once preact/compat is loaded, which a select ignores.
function choose(select: HTMLSelectElement, value: string): void {
  act(() => {
    select.value = value;
    fireEvent(select, new Event('change', { bubbles: true }));
  });
}

function bandValues(container: HTMLElement): string[] {
  const band = container.querySelector<HTMLSelectElement>('#propertyBand');
  return Array.from(band?.options ?? []).map((o) => o.value);
}

describe('CouncilTaxCalculator selects', () => {
  it('offers band I after switching the region to Wales', () => {
    const { container } = render(<CouncilTaxCalculator />);
    expect(bandValues(container)).not.toContain('I');

    choose(container.querySelector('#region') as HTMLSelectElement, 'wales_average');

    expect(bandValues(container)).toContain('I');
  });

  it('recomputes the tax when the band changes', () => {
    const { container } = render(<CouncilTaxCalculator />);
    const expected = formatCurrency(
      calculateCouncilTax({ ...getDefaultInputs(), propertyBand: 'B' }).annualTax
    );
    expect(container.textContent).not.toContain(expected);

    choose(container.querySelector('#propertyBand') as HTMLSelectElement, 'B');

    expect(container.textContent).toContain(expected);
  });

  it('falls back to band H when the new region has no such band', () => {
    const { container } = render(<CouncilTaxCalculator />);
    const region = container.querySelector('#region') as HTMLSelectElement;

    choose(region, 'wales_average');
    choose(container.querySelector('#propertyBand') as HTMLSelectElement, 'I');
    choose(region, 'england_average');

    expect((container.querySelector('#propertyBand') as HTMLSelectElement).value).toBe('H');
  });
});
