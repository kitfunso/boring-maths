import { describe, expect, it } from 'vitest';
import {
  inputsFromParams,
  paramsFromInputs,
} from '../../src/components/calculators/AviosDestinationFinder/urlState';
import { getDefaultInputs } from '../../src/components/calculators/AviosDestinationFinder/types';

describe('Avios finder URL state', () => {
  it('writes nothing for default inputs', () => {
    expect(paramsFromInputs(getDefaultInputs())).toBe('');
  });

  it('round-trips non-default inputs', () => {
    const inputs = {
      ...getDefaultInputs(),
      aviosBudget: 80000,
      cabin: 'business' as const,
      voucher: 'premiumPlus' as const,
      regions: ['Oceania' as const],
      tripType: 'oneWay' as const,
      sortKey: 'value' as const,
      showOverBudget: false,
    };
    const qs = paramsFromInputs(inputs);
    expect(qs).toContain('voucher=premiumPlus');
    expect({ ...getDefaultInputs(), ...inputsFromParams(`?${qs}`) }).toEqual(inputs);
  });

  it('reads voucher=free', () => {
    expect(inputsFromParams('?voucher=free')).toEqual({ voucher: 'free' });
  });

  it('maps the legacy voucher=1 link to Premium Plus (2-for-1 in every cabin)', () => {
    expect(inputsFromParams('?voucher=1&cabin=business')).toEqual({
      voucher: 'premiumPlus',
      cabin: 'business',
    });
  });

  it('ignores unknown or invalid values', () => {
    expect(inputsFromParams('?voucher=gold&cabin=first&budget=-5&sort=nope')).toBeNull();
  });
});
