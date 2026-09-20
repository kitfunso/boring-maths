/** Singapore CPF rates effective 1 Jan 2026, Ordinary Wages up to the $8,000 ceiling; Additional Wages (bonuses) use a separate annual ceiling and are not modelled. */

export const CPF_OW_CEILING = 8000;
export const CPF_GRADUATED_LOWER = 500;
export const CPF_GRADUATED_UPPER = 750;

export interface CpfAgeBandRates {
  label: string;
  totalRate: number;
  employeeRate: number;
  employerRate: number;
  maxEmployeeMonthly: number;
}

export const CPF_AGE_BANDS = {
  upTo55: {
    label: '55 and below',
    totalRate: 0.37,
    employeeRate: 0.2,
    employerRate: 0.17,
    maxEmployeeMonthly: 1600,
  },
  above55To60: {
    label: 'Above 55 to 60',
    totalRate: 0.34,
    employeeRate: 0.18,
    employerRate: 0.16,
    maxEmployeeMonthly: 1440,
  },
  above60To65: {
    label: 'Above 60 to 65',
    totalRate: 0.25,
    employeeRate: 0.125,
    employerRate: 0.125,
    maxEmployeeMonthly: 1000,
  },
  above65To70: {
    label: 'Above 65 to 70',
    totalRate: 0.165,
    employeeRate: 0.075,
    employerRate: 0.09,
    maxEmployeeMonthly: 600,
  },
  above70: {
    label: 'Above 70',
    totalRate: 0.125,
    employeeRate: 0.05,
    employerRate: 0.075,
    maxEmployeeMonthly: 400,
  },
} as const satisfies Record<string, CpfAgeBandRates>;

export type CpfAgeBandKey = keyof typeof CPF_AGE_BANDS;

export interface SingaporeTakeHomeInputs {
  monthlyGrossWage: number;
  ageBand: CpfAgeBandKey;
}

export interface SingaporeTakeHomeResult {
  monthlyGrossWage: number;
  employeeCpf: number;
  employerCpf: number;
  monthlyTakeHome: number;
  annualTakeHome: number;
  effectiveCpfRate: number;
}

export function getDefaultInputs(): SingaporeTakeHomeInputs {
  return { monthlyGrossWage: 5000, ageBand: 'upTo55' };
}

export function calculateEmployeeCpfContribution(wage: number, band: CpfAgeBandRates): number {
  const cappedWage = Math.min(wage, CPF_OW_CEILING);
  if (cappedWage <= CPF_GRADUATED_LOWER) return 0;
  if (cappedWage <= CPF_GRADUATED_UPPER) {
    // Graduated band scales each rate against the 55-and-below 20% base, per CPF's own shape.
    const graduatedFactor = (band.employeeRate / CPF_AGE_BANDS.upTo55.employeeRate) * 0.6;
    return graduatedFactor * (cappedWage - CPF_GRADUATED_LOWER);
  }
  return band.employeeRate * cappedWage;
}

export function calculateEmployerCpfContribution(wage: number, band: CpfAgeBandRates): number {
  return band.employerRate * Math.min(wage, CPF_OW_CEILING);
}

export function calculateSingaporeTakeHome(
  inputs: SingaporeTakeHomeInputs
): SingaporeTakeHomeResult {
  const wage = Math.max(0, inputs.monthlyGrossWage || 0);
  const band = CPF_AGE_BANDS[inputs.ageBand] ?? CPF_AGE_BANDS.upTo55;

  const employeeCpf = calculateEmployeeCpfContribution(wage, band);
  const employerCpf = calculateEmployerCpfContribution(wage, band);
  const monthlyTakeHome = wage - employeeCpf;
  const annualTakeHome = monthlyTakeHome * 12;
  const effectiveCpfRate = wage > 0 ? (employeeCpf / wage) * 100 : 0;

  const round2 = (v: number) => Math.round(v * 100) / 100;

  return {
    monthlyGrossWage: round2(wage),
    employeeCpf: round2(employeeCpf),
    employerCpf: round2(employerCpf),
    monthlyTakeHome: round2(monthlyTakeHome),
    annualTakeHome: round2(annualTakeHome),
    effectiveCpfRate: round2(effectiveCpfRate),
  };
}
