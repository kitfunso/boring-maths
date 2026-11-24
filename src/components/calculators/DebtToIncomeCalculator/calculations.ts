export const FRONT_END_IDEAL_MAX = 28;

export const BACK_END_IDEAL_MAX = 36;

export const BACK_END_QM_MAX = 43;

export interface DebtToIncomeInputs {
  grossMonthlyIncome: number;
  housingPayment: number;
  otherMonthlyDebts: number;
}

export type DTIRating = 'ideal' | 'acceptable' | 'high';

export interface DebtToIncomeResult {
  frontDTI: number;
  backDTI: number;
  totalMonthlyDebt: number;
  rating: DTIRating;
  ratingLabel: string;
  isWithinConventional: boolean;
  isWithinQualifiedMortgage: boolean;
}

function rateBackEnd(backDTI: number): { rating: DTIRating; ratingLabel: string } {
  if (backDTI <= BACK_END_IDEAL_MAX) {
    return { rating: 'ideal', ratingLabel: 'Healthy: within the conventional 36% comfort zone' };
  }
  if (backDTI <= BACK_END_QM_MAX) {
    return {
      rating: 'acceptable',
      ratingLabel: 'Acceptable: above 36% but within the 43% Qualified Mortgage limit',
    };
  }
  return { rating: 'high', ratingLabel: 'High: above the 43% Qualified Mortgage limit' };
}

function roundTo1dp(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateDebtToIncome(inputs: DebtToIncomeInputs): DebtToIncomeResult {
  const safe = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);
  const grossMonthlyIncome = safe(inputs.grossMonthlyIncome);
  const housingPayment = safe(inputs.housingPayment);
  const otherMonthlyDebts = safe(inputs.otherMonthlyDebts);

  const totalMonthlyDebt = housingPayment + otherMonthlyDebts;

  const frontDTI =
    grossMonthlyIncome > 0 ? roundTo1dp((housingPayment / grossMonthlyIncome) * 100) : 0;
  const backDTI =
    grossMonthlyIncome > 0 ? roundTo1dp((totalMonthlyDebt / grossMonthlyIncome) * 100) : 0;

  const { rating, ratingLabel } = rateBackEnd(backDTI);

  return {
    frontDTI,
    backDTI,
    totalMonthlyDebt,
    rating,
    ratingLabel,
    isWithinConventional: backDTI <= BACK_END_IDEAL_MAX,
    isWithinQualifiedMortgage: backDTI <= BACK_END_QM_MAX,
  };
}

export function getDefaultInputs(): DebtToIncomeInputs {
  return {
    grossMonthlyIncome: 6000,
    housingPayment: 1500,
    otherMonthlyDebts: 500,
  };
}
