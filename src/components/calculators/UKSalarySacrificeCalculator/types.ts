/**
 * UK Salary Sacrifice Calculator Types
 * For pension, cycle-to-work, childcare, and EV schemes
 */

export type SacrificeType = 'pension' | 'cycle' | 'childcare' | 'ev';
export type TaxRegion = 'england' | 'scotland';

export interface UKSalarySacrificeInputs {
  grossSalary: number;
  sacrificeAmount: number;
  sacrificeType: SacrificeType;
  taxRegion: TaxRegion;
}

export interface UKSalarySacrificeResult {
  grossSalaryBefore: number;
  grossSalaryAfter: number;
  incomeTaxBefore: number;
  incomeTaxAfter: number;
  incomeTaxSaved: number;
  niBeforeEmployee: number;
  niAfterEmployee: number;
  niSavedEmployee: number;
  niSavedEmployer: number;
  netPayBefore: number;
  netPayAfter: number;
  trueCostOfBenefit: number;
  effectiveDiscount: number;
  totalSavings: number;
}

export function getDefaultInputs(): UKSalarySacrificeInputs {
  return {
    grossSalary: 50000,
    sacrificeAmount: 5000,
    sacrificeType: 'pension',
    taxRegion: 'england',
  };
}

export const SACRIFICE_TYPES = {
  pension: {
    name: 'Pension',
    description: 'Employer pension contributions via salary sacrifice',
  },
  cycle: {
    name: 'Cycle to Work',
    description: 'Tax-free bike and equipment up to £1,000 (or higher with employer)',
  },
  childcare: {
    name: 'Childcare Vouchers',
    description: 'Tax-free childcare vouchers (legacy scheme)',
  },
  ev: {
    name: 'Electric Vehicle',
    description: 'Ultra low emission vehicle via salary sacrifice',
  },
};

// 2024/25 England/NI Income Tax bands
export const ENGLAND_TAX_BANDS = {
  personalAllowance: 12570,
  basicRate: { threshold: 50270, rate: 0.2 },
  higherRate: { threshold: 125140, rate: 0.4 },
  additionalRate: { rate: 0.45 },
};

// 2024/25 Scotland Income Tax bands
export const SCOTLAND_TAX_BANDS = {
  personalAllowance: 12570,
  starterRate: { threshold: 14876, rate: 0.19 },
  basicRate: { threshold: 26561, rate: 0.2 },
  intermediateRate: { threshold: 43662, rate: 0.21 },
  higherRate: { threshold: 75000, rate: 0.42 },
  advancedRate: { threshold: 125140, rate: 0.45 },
  topRate: { rate: 0.48 },
};

// 2024/25 National Insurance rates
export const NI_RATES = {
  primaryThreshold: 12570,
  upperEarningsLimit: 50270,
  mainRate: 0.08, // 8% between thresholds
  upperRate: 0.02, // 2% above UEL
  employerRate: 0.138, // 13.8% employer NI
  employerThreshold: 9100,
};
