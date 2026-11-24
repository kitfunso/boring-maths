export interface DateDifferenceInputs {
  startDate: string;

  endDate: string;

  includeEndDate: boolean;

  showBusinessDays: boolean;
}

export interface DateBreakdown {
  years: number;
  months: number;
  days: number;
}

export interface DateDifferenceResult {
  totalDays: number;

  totalWeeks: number;

  remainingDaysAfterWeeks: number;

  totalMonths: number;

  totalYears: number;

  breakdown: DateBreakdown;

  businessDays: number;

  weekendDays: number;

  isNegative: boolean;
}

function formatToday(offset: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultInputs(): DateDifferenceInputs {
  return {
    startDate: formatToday(0),
    endDate: formatToday(30),
    includeEndDate: false,
    showBusinessDays: true,
  };
}

export const DEFAULT_INPUTS: DateDifferenceInputs = getDefaultInputs();
