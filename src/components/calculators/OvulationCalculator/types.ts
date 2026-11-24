export interface OvulationInputs {
  lastPeriodDate: string;
  cycleLength: number;
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
  upcomingCycles: FertileWindow[];
}

export function getDefaultInputs(): OvulationInputs {
  const today = new Date();
  const lastPeriod = new Date(today);
  lastPeriod.setDate(lastPeriod.getDate() - 14);
  return {
    lastPeriodDate: lastPeriod.toISOString().split('T')[0],
    cycleLength: 28,
  };
}
