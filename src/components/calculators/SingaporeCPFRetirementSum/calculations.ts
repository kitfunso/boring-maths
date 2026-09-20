/** Singapore CPF Retirement Sum Calculator (2026 figures). No CPF LIFE payout
 * is computed: CPF Board does not publish that formula for arbitrary balances. */

// 2026 CPF Board figures. ERS moved to 4x BRS from 1 Jan 2025 (was 3x before).
export const BASIC_RETIREMENT_SUM = 110200;
export const FULL_RETIREMENT_SUM = 220400;
export const ENHANCED_RETIREMENT_SUM = 440800;
export const BASIC_HEALTHCARE_SUM = 79000;

export const CPF_PROJECTION_RATE = 0.04; // Special/MediSave/Retirement Account rate
export const CPF_PROJECTION_AGE = 55;

export interface CPFRetirementSumInputs {
  currentBalance: number;
  currentAge: number;
  annualContribution: number;
}

export interface CPFRetirementSumResult {
  currentBalance: number;
  currentAge: number;
  meetsBRS: boolean;
  meetsFRS: boolean;
  meetsERS: boolean;
  shortfallToBRS: number;
  shortfallToFRS: number;
  shortfallToERS: number;
  projectedBalanceAt55: number | null; // null when already 55 or older
  yearsToProjection: number;
}

export function getDefaultInputs(): CPFRetirementSumInputs {
  return {
    currentBalance: 50000,
    currentAge: 35,
    annualContribution: 8000,
  };
}

// Compounds annually at the CPF rate, adding the contribution at the end of each year.
function projectBalance(balance: number, years: number, annualContribution: number): number {
  let projected = balance;
  for (let i = 0; i < years; i++) {
    projected = projected * (1 + CPF_PROJECTION_RATE) + annualContribution;
  }
  return projected;
}

export function calculateCPFRetirementSum(inputs: CPFRetirementSumInputs): CPFRetirementSumResult {
  const currentBalance = Math.max(0, inputs.currentBalance || 0);
  const currentAge = Math.max(0, inputs.currentAge || 0);
  const annualContribution = Math.max(0, inputs.annualContribution || 0);

  const round2 = (v: number) => Math.round(v * 100) / 100;

  const yearsToProjection = Math.max(0, CPF_PROJECTION_AGE - currentAge);
  const projectedBalanceAt55 =
    currentAge >= CPF_PROJECTION_AGE
      ? null
      : round2(projectBalance(currentBalance, yearsToProjection, annualContribution));

  return {
    currentBalance: round2(currentBalance),
    currentAge,
    meetsBRS: currentBalance >= BASIC_RETIREMENT_SUM,
    meetsFRS: currentBalance >= FULL_RETIREMENT_SUM,
    meetsERS: currentBalance >= ENHANCED_RETIREMENT_SUM,
    shortfallToBRS: round2(Math.max(0, BASIC_RETIREMENT_SUM - currentBalance)),
    shortfallToFRS: round2(Math.max(0, FULL_RETIREMENT_SUM - currentBalance)),
    shortfallToERS: round2(Math.max(0, ENHANCED_RETIREMENT_SUM - currentBalance)),
    projectedBalanceAt55,
    yearsToProjection,
  };
}
