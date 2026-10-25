/** Number inputs must keep what the user types. These handlers once parsed the event object, so every keystroke reset the field to 0. */

import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import type { ComponentType } from 'preact';
import { BatchCostCalculator } from '../../src/components/calculators/BatchCostCalculator/BatchCostCalculator';
import { CandleWaxCalculator } from '../../src/components/calculators/CandleWaxCalculator/CandleWaxCalculator';
import { CO2Calculator } from '../../src/components/calculators/CO2Calculator/CO2Calculator';
import { CuttingTimeCalculator } from '../../src/components/calculators/CuttingTimeCalculator/CuttingTimeCalculator';
import { EIDosingCalculator } from '../../src/components/calculators/EIDosingCalculator/EIDosingCalculator';
import { FragranceCalculator } from '../../src/components/calculators/FragranceCalculator/FragranceCalculator';
import { GlazeCalculator } from '../../src/components/calculators/GlazeCalculator/GlazeCalculator';
import { IBUCalculator } from '../../src/components/calculators/IBUCalculator/IBUCalculator';
import { KilnCostCalculator } from '../../src/components/calculators/KilnCostCalculator/KilnCostCalculator';
import { MashWaterCalculator } from '../../src/components/calculators/MashWaterCalculator/MashWaterCalculator';
import { PrimingSugarCalculator } from '../../src/components/calculators/PrimingSugarCalculator/PrimingSugarCalculator';
import { ToolDeflectionCalculator } from '../../src/components/calculators/ToolDeflectionCalculator/ToolDeflectionCalculator';
import { WaterChangeCalculator } from '../../src/components/calculators/WaterChangeCalculator/WaterChangeCalculator';
import { YeastPitchRateCalculator } from '../../src/components/calculators/YeastPitchRateCalculator/YeastPitchRateCalculator';

const CALCULATORS: [string, ComponentType][] = [
  ['BatchCost', BatchCostCalculator],
  ['CandleWax', CandleWaxCalculator],
  ['CO2', CO2Calculator],
  ['CuttingTime', CuttingTimeCalculator],
  ['EIDosing', EIDosingCalculator],
  ['Fragrance', FragranceCalculator],
  ['Glaze', GlazeCalculator],
  ['IBU', IBUCalculator],
  ['KilnCost', KilnCostCalculator],
  ['MashWater', MashWaterCalculator],
  ['PrimingSugar', PrimingSugarCalculator],
  ['ToolDeflection', ToolDeflectionCalculator],
  ['WaterChange', WaterChangeCalculator],
  ['YeastPitchRate', YeastPitchRateCalculator],
];

describe.each(CALCULATORS)('%s number inputs', (_name, Calculator) => {
  it('keep a typed value and have a visible label', () => {
    const { container } = render(<Calculator />);
    const inputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="number"]'));
    expect(inputs.length).toBeGreaterThan(0);

    for (const input of inputs) {
      fireEvent.input(input, { target: { value: '7' } });
      expect(input.value, input.id).toBe('7');
      const label = input.id && container.querySelector(`label[for="${input.id}"]`);
      expect(label || input.getAttribute('aria-label'), input.id).toBeTruthy();
    }
  });
});
