/**
 * Ovulation Calculator - Calculation Logic
 *
 * Ovulation typically occurs 14 days before the next period.
 * Fertile window: 5 days before ovulation through the day after, since the egg lives up to 24 hours.
 */

import type { OvulationInputs, OvulationResult, FertileWindow } from './types';

function addDays(dateStr: string, days: number): string {
  // ISO dates parse as UTC midnight, so UTC arithmetic keeps a DST change from shifting the day.
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function calculateCycle(periodDate: string, cycleLength: number): FertileWindow {
  const ovulationDay = cycleLength - 14;
  const ovulationDate = addDays(periodDate, ovulationDay);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = addDays(ovulationDate, 1);
  const nextPeriod = addDays(periodDate, cycleLength);

  return {
    start: fertileStart,
    end: fertileEnd,
    ovulationDate,
    nextPeriodDate: nextPeriod,
  };
}

export function calculateOvulation(inputs: OvulationInputs): OvulationResult {
  const { lastPeriodDate, cycleLength } = inputs;

  const cycles: FertileWindow[] = [];
  let periodDate = lastPeriodDate;

  for (let i = 0; i < 4; i++) {
    const cycle = calculateCycle(periodDate, cycleLength);
    cycles.push(cycle);
    periodDate = cycle.nextPeriodDate;
  }

  const current = cycles[0];

  return {
    ovulationDate: current.ovulationDate,
    fertileWindowStart: current.start,
    fertileWindowEnd: current.end,
    nextPeriodDate: current.nextPeriodDate,
    upcomingCycles: cycles.slice(1),
  };
}
