/**
 * UK Capital Gains Tax Calculations
 * 2026/27 rates
 */

import type { UKCGTInputs, UKCGTResult } from './types';

// CGT rates: unified at 18%/24% for all chargeable assets for disposals
// on or after 30 October 2024 (shares/other rose from 10%/20%).
// Verified against gov.uk/capital-gains-tax/rates 2026-07-03.
const CGT_RATES = {
  property: { basic: 0.18, higher: 0.24 },
  other: { basic: 0.18, higher: 0.24 },
};

const ANNUAL_EXEMPTION = 3000; // 2026/27 (reduced from £6,000)
const BASIC_RATE_THRESHOLD = 37700; // Basic rate band width

export function calculateUKCGT(inputs: UKCGTInputs): UKCGTResult {
  const { salePrice, purchasePrice, costs, assetType, taxBand, annualIncome, useAnnualExemption } =
    inputs;

  const gain = Math.max(0, salePrice - purchasePrice - costs);
  const annualExemption = useAnnualExemption ? Math.min(ANNUAL_EXEMPTION, gain) : 0;
  const taxableGain = Math.max(0, gain - annualExemption);

  const rates = CGT_RATES[assetType];

  // Calculate how much of the basic rate band is remaining
  const personalAllowance = 12570; // keep in sync with UKTaxCalculator/types.ts PERSONAL_ALLOWANCE
  const taxableIncome = Math.max(0, annualIncome - personalAllowance);
  const basicRateBandRemaining =
    taxBand === 'basic' ? Math.max(0, BASIC_RATE_THRESHOLD - taxableIncome) : 0;

  const basicRateAmount = Math.min(taxableGain, basicRateBandRemaining);
  const higherRateAmount = Math.max(0, taxableGain - basicRateAmount);

  const basicRateTax = Math.round(basicRateAmount * rates.basic);
  const higherRateTax = Math.round(higherRateAmount * rates.higher);
  const totalTax = basicRateTax + higherRateTax;

  return {
    gain,
    annualExemption,
    taxableGain,
    basicRateAmount,
    higherRateAmount,
    basicRateTax,
    higherRateTax,
    totalTax,
    effectiveRate: gain > 0 ? (totalTax / gain) * 100 : 0,
    basicRate: rates.basic * 100,
    higherRate: rates.higher * 100,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
