/**
 * Ovulation Calculator - Type Definitions
 */

export interface OvulationInputs {
  lastPeriodDate: string; // ISO date string
  cycleLength: number; // days, typically 21-35
}

export interface FertileWindow {
  start: string;
  end: string;
  ovulationDate: string;
  nextPeriodDate: string;
}

export interface OvulationResult {
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  nextPeriodDate: string;
  /** Next 3 cycles */
  upcomingCycles: FertileWindow[];
}

export function getDefaultInputs(): OvulationInputs {
  const today = new Date();
  // Default to ~14 days ago as last period
  const lastPeriod = new Date(today);
  lastPeriod.setDate(lastPeriod.getDate() - 14);
  return {
    lastPeriodDate: lastPeriod.toISOString().split('T')[0],
    cycleLength: 28,
  };
}
