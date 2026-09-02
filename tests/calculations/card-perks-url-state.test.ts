import { describe, expect, it } from 'vitest';
import {
  inputsFromParams,
  paramsFromInputs,
} from '../../src/components/calculators/CardPerksCalculator/urlState';
import {
  buildDefaultInputs,
  type DefaultAssumptions,
} from '../../src/components/calculators/CardPerksCalculator/types';

const FIXTURE_ASSUMPTIONS: DefaultAssumptions = {
  pointValuePence: {
    avios: 1,
    membershipRewards: 1,
    virginPoints: 0.7,
    nectar: 0.5,
    clubcard: 1,
    revpoints: 0.5,
    cashback: 1,
    none: 0,
  },
  loungeVisitValue: 25,
  insuranceValue: 30,
  voucherValue: 400,
};

const defaults = buildDefaultInputs(FIXTURE_ASSUMPTIONS);

describe('Card Perks Calculator URL state', () => {
  it('writes nothing for default inputs', () => {
    expect(paramsFromInputs(defaults, defaults)).toBe('');
  });

  it('round-trips a non-default input set', () => {
    const inputs = {
      ...defaults,
      spend: { groceries: 9000, travel: 500, dining: 250, other: 3000 },
      spendAbroad: 2000,
      loungeVisits: 4,
      clearsBalance: false,
      carriedBalance: 1500,
      horizon: 'year1' as const,
      pointValuePence: {
        ...defaults.pointValuePence,
        avios: 1.8,
        membershipRewards: 1.8,
        virginPoints: 1.8,
      },
      loungeVisitValue: 30,
      insuranceValue: 45,
      voucherValue: 500,
      types: ['credit', 'debit'] as const,
      loungeOnly: true,
      noFeeOnly: true,
      sortKey: 'fees' as const,
    };
    const qs = paramsFromInputs(inputs, defaults);
    expect(qs).toContain('sort=fees');
    expect(inputsFromParams(`?${qs}`, defaults)).toEqual(inputs);
  });

  it('falls back to defaults when values are garbage', () => {
    expect(inputsFromParams('?g=abc&sort=nope&horizon=whenever', defaults)).toEqual(defaults);
  });

  it('ignores a negative number in any numeric param', () => {
    expect(inputsFromParams('?g=-500&balance=-10&avios=-1', defaults)).toEqual(defaults);
  });

  it('drops an unknown type from the csv list', () => {
    expect(inputsFromParams('?types=credit,spaceship', defaults)).toEqual({
      ...defaults,
      types: ['credit'],
    });
  });
});
