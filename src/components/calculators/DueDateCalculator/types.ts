export type CalculationMethod = 'lmp' | 'conception' | 'ivf' | 'ultrasound';

export interface DueDateInputs {
  method: CalculationMethod;
  lmpDate: string;
  conceptionDate: string;
  ivfDate: string;
  ivfDayType: '3day' | '5day';
  ultrasoundDate: string;
  ultrasoundWeeks: number;
  ultrasoundDays: number;
  cycleLength: number;
}

export interface DueDateResult {
  dueDate: Date;
  dueDateFormatted: string;
  currentWeeks: number;
  currentDays: number;
  trimester: 1 | 2 | 3;
  trimesterName: string;
  daysUntilDue: number;
  daysPregnant: number;
  percentComplete: number;
  conceptionDateEstimate: string;
  milestones: Milestone[];
}

export interface Milestone {
  week: number;
  name: string;
  description: string;
  date: string;
  isPast: boolean;
}

export function getDefaultInputs(): DueDateInputs {
  const today = new Date();
  const lmp = new Date(today);
  lmp.setDate(lmp.getDate() - 56);

  return {
    method: 'lmp',
    lmpDate: lmp.toISOString().split('T')[0],
    conceptionDate: '',
    ivfDate: '',
    ivfDayType: '5day',
    ultrasoundDate: '',
    ultrasoundWeeks: 8,
    ultrasoundDays: 0,
    cycleLength: 28,
  };
}

export const DEFAULT_INPUTS: DueDateInputs = getDefaultInputs();
