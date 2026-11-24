import type { Currency } from '../../../lib/regions';

export interface SalaryToHourlyInputs {
  currency: Currency;

  annualSalary: number;

  hoursPerWeek: number;

  ptoDays: number;

  paidHolidays: number;

  benefitsValue: number;

  includeBenefits: boolean;

  unpaidTimeOff: number;
}

export interface SalaryToHourlyResult {
  currency: Currency;

  standardHourlyRate: number;

  actualHourlyRate: number;

  totalCompHourlyRate: number;

  totalCompensation: number;

  actualHoursPerYear: number;

  standardHoursPerYear: number;

  extraHoursPerYear: number;

  unpaidOvertimeValue: number;

  dailyRate: number;

  weeklyRate: number;

  monthlyRate: number;

  biweeklyRate: number;

  ptoDayValue: number;

  totalPtoValue: number;

  effectiveWeeksWorked: number;

  comparison: {
    hourlyAt40: number;
    hourlyAt45: number;
    hourlyAt50: number;
    hourlyAt55: number;
  };
}

export function getDefaultInputs(currency: Currency = 'USD'): SalaryToHourlyInputs {
  const salary = currency === 'GBP' ? 45000 : currency === 'EUR' ? 50000 : 65000;
  const pto = currency === 'GBP' ? 25 : currency === 'EUR' ? 28 : 15;
  const holidays = currency === 'GBP' ? 8 : currency === 'EUR' ? 10 : 10;
  const benefits = currency === 'GBP' ? 3000 : currency === 'EUR' ? 5000 : 12000;

  return {
    currency,
    annualSalary: salary,
    hoursPerWeek: 45,
    ptoDays: pto,
    paidHolidays: holidays,
    benefitsValue: benefits,
    includeBenefits: true,
    unpaidTimeOff: 0,
  };
}

export const DEFAULT_INPUTS: SalaryToHourlyInputs = getDefaultInputs('USD');
