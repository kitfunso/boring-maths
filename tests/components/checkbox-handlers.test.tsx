/** Checkbox hands onChange a boolean, not an event; handlers that read e.target threw on every click. */

import { describe, it, expect } from 'vitest';
import { render, fireEvent, act } from '@testing-library/preact';
import type { ComponentType } from 'preact';
import SalaryToHourly from '../../src/components/calculators/SalaryToHourly/SalaryToHourly';
import OvertimeCalculator from '../../src/components/calculators/OvertimeCalculator/OvertimeCalculator';
import BuyVsRent from '../../src/components/calculators/BuyVsRent/BuyVsRent';

const cases: [string, ComponentType, string][] = [
  ['SalaryToHourly', SalaryToHourly, '#includeBenefits'],
  ['OvertimeCalculator', OvertimeCalculator, '#includeFICA'],
  ['BuyVsRent', BuyVsRent, '#includeTaxBenefits'],
];

describe('Checkbox handlers', () => {
  it.each(cases)('%s toggles its checkbox without throwing', (_name, Component, selector) => {
    const { container } = render(<Component />);
    const box = container.querySelector(selector) as HTMLInputElement;
    expect(box).not.toBeNull();
    const before = box.checked;

    act(() => {
      fireEvent.click(box);
    });

    expect((container.querySelector(selector) as HTMLInputElement).checked).toBe(!before);
  });
});
