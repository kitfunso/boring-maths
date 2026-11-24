import type { Currency } from '../../../lib/regions';

export interface EmployeeCostInputs {
  currency: Currency;

  annualSalary: number;

  healthInsurance: number;

  retirementMatchPercent: number;

  ptoDays: number;

  payrollTaxPercent: number;

  trainingBudget: number;

  equipmentCost: number;

  officeCost: number;

  otherBenefits: number;

  hoursPerWeek: number;

  profitMarginPercent: number;
}

export interface CostBreakdown {
  category: string;
  annual: number;
  monthly: number;
  hourly: number;
  percentOfTotal: number;
}

export interface EmployeeCostResult {
  currency: Currency;

  totalAnnualCost: number;

  trueHourlyCost: number;

  monthlyBurdenCost: number;

  burdenMultiplier: number;

  breakdown: CostBreakdown[];

  billableRate: number;

  costPerWorkingDay: number;
  actualWorkingHours: number;
  effectiveHourlyRate: number;
  salaryVsTotalCost: {
    salary: number;
    benefits: number;
    taxes: number;
    overhead: number;
  };

  insights: string[];
}

export const PAYROLL_TAX_RATES: Record<Currency, number> = {
  USD: 7.65, // FICA (Social Security + Medicare)
  GBP: 13.8, // Employer's NI
  EUR: 20, // Varies by country, avg estimate
};

export const HEALTH_INSURANCE_COSTS: Record<Currency, number> = {
  USD: 7500, // Average employer contribution
  GBP: 0, // NHS
  EUR: 3000, // Varies significantly
};

export function getDefaultInputs(currency: Currency = 'USD'): EmployeeCostInputs {
  const salaryMultiplier = currency === 'GBP' ? 0.75 : currency === 'EUR' ? 0.85 : 1;

  return {
    currency,
    annualSalary: Math.round(60000 * salaryMultiplier),
    healthInsurance: HEALTH_INSURANCE_COSTS[currency],
    retirementMatchPercent: currency === 'GBP' ? 3 : 4, // 401k match or pension
    ptoDays: currency === 'USD' ? 15 : currency === 'GBP' ? 28 : 25,
    payrollTaxPercent: PAYROLL_TAX_RATES[currency],
    trainingBudget: Math.round(1500 * salaryMultiplier),
    equipmentCost: Math.round(2000 * salaryMultiplier),
    officeCost: Math.round(6000 * salaryMultiplier),
    otherBenefits: Math.round(1000 * salaryMultiplier),
    hoursPerWeek: 40,
    profitMarginPercent: 30,
  };
}

export const DEFAULT_INPUTS: EmployeeCostInputs = getDefaultInputs('USD');
