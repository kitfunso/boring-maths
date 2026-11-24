export interface AgeCalculatorInputs {
  birthDate: string;
  targetDate: string;
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  daysUntilBirthday: number;
  nextBirthday: string;
  dayOfWeekBorn: string;
  zodiacSign: string;
  chineseZodiac: string;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getDefaultInputs(): AgeCalculatorInputs {
  const today = new Date();
  const birthYear = today.getFullYear() - 30;
  const birthDate = new Date(birthYear, today.getMonth(), today.getDate());

  return {
    birthDate: formatDate(birthDate),
    targetDate: formatDate(today),
  };
}

export const DEFAULT_INPUTS: AgeCalculatorInputs = getDefaultInputs();
