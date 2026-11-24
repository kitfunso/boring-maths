import type { BTUCalculatorInputs, BTUCalculatorResult } from './types';
import {
  BTU_PER_SQFT_COOLING,
  BTU_PER_SQFT_HEATING,
  STANDARD_CEILING_HEIGHT,
  SUN_EXPOSURE_FACTOR,
  INSULATION_FACTOR,
  KITCHEN_EXTRA_BTU,
  BTU_PER_EXTRA_OCCUPANT,
  BTU_PER_HR_TO_KW,
  BTU_PER_TON,
  SQFT_PER_SQM,
  FEET_PER_METER,
} from './types';

const safe = (v: number): number => (Number.isFinite(v) ? Math.max(0, v) : 0);

const roundBtu = (v: number): number => Math.round(v / 100) * 100;

export function calculateBTUCalculator(inputs: BTUCalculatorInputs): BTUCalculatorResult {
  const currency = inputs.currency;
  const mode = inputs.mode === 'heating' ? 'heating' : 'cooling';

  const roomLength = safe(inputs.roomLength);
  const roomWidth = safe(inputs.roomWidth);
  const ceilingHeight = safe(inputs.ceilingHeight);
  const occupants = safe(inputs.occupants);

  const isMetric = inputs.unit === 'm';
  const lengthFt = isMetric ? roomLength * FEET_PER_METER : roomLength;
  const widthFt = isMetric ? roomWidth * FEET_PER_METER : roomWidth;
  const ceilingHeightFt = isMetric ? ceilingHeight * FEET_PER_METER : ceilingHeight;

  const areaSqFt = isMetric ? roomLength * roomWidth * SQFT_PER_SQM : lengthFt * widthFt;

  if (areaSqFt <= 0) {
    return {
      currency,
      areaSqFt: 0,
      baseBtu: 0,
      recommendedBtu: 0,
      recommendedKw: 0,
      tons: 0,
      isValid: false,
      warning: 'Enter a room length and width greater than zero to size your unit.',
    };
  }

  const baseRate = mode === 'cooling' ? BTU_PER_SQFT_COOLING : BTU_PER_SQFT_HEATING;
  const baseBtu = areaSqFt * baseRate;

  const heightFactor = ceilingHeightFt > 0 ? ceilingHeightFt / STANDARD_CEILING_HEIGHT : 1;

  const environmentFactor =
    mode === 'cooling'
      ? (SUN_EXPOSURE_FACTOR[inputs.sunExposure] ?? 1)
      : (INSULATION_FACTOR[inputs.insulation] ?? 1);

  const kitchenBtu = inputs.roomUse === 'kitchen' ? KITCHEN_EXTRA_BTU : 0;
  const extraOccupants = Math.max(0, occupants - 2);
  const occupantBtu = extraOccupants * BTU_PER_EXTRA_OCCUPANT;

  const adjustedBtu = baseBtu * heightFactor * environmentFactor + kitchenBtu + occupantBtu;
  const recommendedBtu = roundBtu(adjustedBtu);

  const recommendedKw = recommendedBtu * BTU_PER_HR_TO_KW;
  const tons = mode === 'cooling' ? recommendedBtu / BTU_PER_TON : 0;

  return {
    currency,
    areaSqFt: Math.round(areaSqFt * 10) / 10,
    baseBtu: Math.round(baseBtu),
    recommendedBtu,
    recommendedKw: Math.round(recommendedKw * 100) / 100,
    tons: Math.round(tons * 100) / 100,
    isValid: true,
    warning: '',
  };
}
