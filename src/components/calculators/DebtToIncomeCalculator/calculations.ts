/** Debt-to-Income (DTI) Calculator: front-end DTI = housing payment / gross monthly income; back-end DTI = (housing payment + other debts) / gross monthly income, both as % of gross (pre-tax) income. Thresholds are lender conventions, not law; the only legal reference is the CFPB Qualified Mortgage back-end limit of 43% (12 CFR 1026.43, eff. 2014), a safe-harbour for lenders, not a hard cap on borrowers. */

// Front-end ratio at or below this is considered ideal by most conventional lenders.
export const FRONT_END_IDEAL_MAX = 28;

// Back-end (all debt) ratio at or below this is the classic conventional comfort zone.
export const BACK_END_IDEAL_MAX = 36;

// Back-end ratio at or below this still qualifies under the CFPB QM Ability-to-Repay rule; above it is high risk.
export const BACK_END_QM_MAX = 43;

export interface DebtToIncomeInputs {
  // Gross (pre-tax) income per month.
  grossMonthlyIncome: number;
  // Total monthly housing payment: mortgage/rent plus property tax, insurance, HOA and PMI where they apply.
  housingPayment: number;
  // All other recurring monthly debt: car loans, student loans, card minimums, personal loans, child support.
  otherMonthlyDebts: number;
}

// Plain-English rating buckets for the back-end ratio.
export type DTIRating = 'ideal' | 'acceptable' | 'high';

export interface DebtToIncomeResult {
  // Front-end ratio as a percentage, for example 25 means 25 percent.
  frontDTI: number;
  // Back-end ratio as a percentage.
  backDTI: number;
  // Total monthly debt used in the back-end ratio.
  totalMonthlyDebt: number;
  // Rating of the back-end ratio against conventional lender thresholds.
  rating: DTIRating;
  ratingLabel: string;
  // True when the back-end ratio is within the conventional 36 percent zone.
  isWithinConventional: boolean;
  // True when the back-end ratio is within the 43 percent Qualified Mortgage limit.
  isWithinQualifiedMortgage: boolean;
}

/** Maps back-end DTI to a rating against conventional thresholds; front-end is judged separately by the caller. */
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

/** DTI is conventionally quoted to a tenth of a percent. */
function roundTo1dp(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Negative inputs floor at zero so a cleared field can't produce a nonsensical ratio; zero income reports zero ratios instead of dividing by zero. */
export function calculateDebtToIncome(inputs: DebtToIncomeInputs): DebtToIncomeResult {
  // Floor at 0 and treat non-finite (cleared/NaN) fields as 0 so the ratios stay finite.
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

/** Defaults yield a 25% front-end and 33.3% back-end ratio, both inside the conventional zone. */
export function getDefaultInputs(): DebtToIncomeInputs {
  return {
    grossMonthlyIncome: 6000,
    housingPayment: 1500,
    otherMonthlyDebts: 500,
  };
}
