import type { SalaryToHourlyInputs, SalaryToHourlyResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

const WEEKS_PER_YEAR = 52;

const WORKING_DAYS_PER_YEAR = 260;

const STANDARD_HOURS_PER_YEAR = 2080;

export function calculateSalaryToHourly(inputs: SalaryToHourlyInputs): SalaryToHourlyResult {
  const {
    currency,
    annualSalary,
    hoursPerWeek,
    ptoDays,
    paidHolidays,
    benefitsValue,
    includeBenefits,
    unpaidTimeOff,
  } = inputs;

  const totalCompensation = annualSalary + (includeBenefits ? benefitsValue : 0);

  const totalPaidTimeOff = ptoDays + paidHolidays;
  const ptoWeeks = totalPaidTimeOff / 5;
  const effectiveWeeksWorked = WEEKS_PER_YEAR - ptoWeeks - unpaidTimeOff;

  const standardHourlyRate = annualSalary / STANDARD_HOURS_PER_YEAR;

  const actualHoursPerYear = hoursPerWeek * effectiveWeeksWorked;

  const standardWeeklyHours = 40;
  const extraHoursPerWeek = Math.max(0, hoursPerWeek - standardWeeklyHours);
  const extraHoursPerYear = extraHoursPerWeek * effectiveWeeksWorked;

  const actualHourlyRate = annualSalary / actualHoursPerYear;

  const totalCompHourlyRate = totalCompensation / actualHoursPerYear;

  const unpaidOvertimeValue = extraHoursPerYear * standardHourlyRate;

  const dailyRate = annualSalary / WORKING_DAYS_PER_YEAR;
  const weeklyRate = annualSalary / WEEKS_PER_YEAR;
  const monthlyRate = annualSalary / 12;
  const biweeklyRate = annualSalary / 26;

  const ptoDayValue = dailyRate;
  const totalPtoValue = ptoDayValue * ptoDays;

  const comparison = {
    hourlyAt40: annualSalary / (40 * effectiveWeeksWorked),
    hourlyAt45: annualSalary / (45 * effectiveWeeksWorked),
    hourlyAt50: annualSalary / (50 * effectiveWeeksWorked),
    hourlyAt55: annualSalary / (55 * effectiveWeeksWorked),
  };

  return {
    currency,
    standardHourlyRate: Math.round(standardHourlyRate * 100) / 100,
    actualHourlyRate: Math.round(actualHourlyRate * 100) / 100,
    totalCompHourlyRate: Math.round(totalCompHourlyRate * 100) / 100,
    totalCompensation: Math.round(totalCompensation),
    actualHoursPerYear: Math.round(actualHoursPerYear),
    standardHoursPerYear: STANDARD_HOURS_PER_YEAR,
    extraHoursPerYear: Math.round(extraHoursPerYear),
    unpaidOvertimeValue: Math.round(unpaidOvertimeValue),
    dailyRate: Math.round(dailyRate * 100) / 100,
    weeklyRate: Math.round(weeklyRate * 100) / 100,
    monthlyRate: Math.round(monthlyRate * 100) / 100,
    biweeklyRate: Math.round(biweeklyRate * 100) / 100,
    ptoDayValue: Math.round(ptoDayValue * 100) / 100,
    totalPtoValue: Math.round(totalPtoValue),
    effectiveWeeksWorked: Math.round(effectiveWeeksWorked * 10) / 10,
    comparison: {
      hourlyAt40: Math.round(comparison.hourlyAt40 * 100) / 100,
      hourlyAt45: Math.round(comparison.hourlyAt45 * 100) / 100,
      hourlyAt50: Math.round(comparison.hourlyAt50 * 100) / 100,
      hourlyAt55: Math.round(comparison.hourlyAt55 * 100) / 100,
    },
  };
}

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
