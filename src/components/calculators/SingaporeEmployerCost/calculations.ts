/** Employer side of Singapore CPF plus the Skills Development Levy (SDL), rates effective 1 Jan 2026. */

import {
  CPF_AGE_BANDS,
  calculateEmployerCpfContribution,
  type CpfAgeBandKey,
  type CpfAgeBandRates,
} from '../SingaporeTakeHomePay/calculations';

export { CPF_AGE_BANDS };
export type { CpfAgeBandKey };

export const SDL_RATE = 0.0025;
export const SDL_WAGE_CEILING = 4500;
export const SDL_MIN = 2;
export const SDL_MAX = 11.25;

export interface SingaporeEmployerCostInputs {
  monthlyGrossWage: number;
  ageBand: CpfAgeBandKey;
}

export interface SingaporeEmployerCostResult {
  monthlyGrossWage: number;
  employerCpf: number;
  sdl: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  costPercentOnTop: number;
}

export function getDefaultInputs(): SingaporeEmployerCostInputs {
  return { monthlyGrossWage: 5000, ageBand: 'upTo55' };
}

// SDL is payable on every employee: 0.25% of wages up to $4,500, floored at $2, capped at $11.25.
export function calculateSDL(wage: number): number {
  if (wage <= 0) return 0;
  const raw = Math.min(wage, SDL_WAGE_CEILING) * SDL_RATE;
  return Math.min(SDL_MAX, Math.max(SDL_MIN, raw));
}

export function calculateSingaporeEmployerCost(
  inputs: SingaporeEmployerCostInputs
): SingaporeEmployerCostResult {
  const wage = Math.max(0, inputs.monthlyGrossWage || 0);
  const band: CpfAgeBandRates = CPF_AGE_BANDS[inputs.ageBand] ?? CPF_AGE_BANDS.upTo55;

  const employerCpf = calculateEmployerCpfContribution(wage, band);
  const sdl = calculateSDL(wage);
  const totalMonthlyCost = wage + employerCpf + sdl;
  const totalAnnualCost = totalMonthlyCost * 12;
  const costPercentOnTop = wage > 0 ? ((employerCpf + sdl) / wage) * 100 : 0;

  const round2 = (v: number) => Math.round(v * 100) / 100;

  return {
    monthlyGrossWage: round2(wage),
    employerCpf: round2(employerCpf),
    sdl: round2(sdl),
    totalMonthlyCost: round2(totalMonthlyCost),
    totalAnnualCost: round2(totalAnnualCost),
    costPercentOnTop: round2(costPercentOnTop),
  };
}
