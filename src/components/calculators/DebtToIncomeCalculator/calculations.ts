/**
 * Debt-to-Income (DTI) Calculator - pure logic.
 *
 * Computes the two ratios US mortgage lenders use to judge how much of a
 * borrower's gross monthly income is committed to debt:
 *
 *   Front-end DTI = housing payment / gross monthly income
 *   Back-end DTI  = (housing payment + other monthly debts) / gross monthly income
 *
 * Both are expressed as a percentage of gross (pre-tax) income.
 *
 * There is no statutory constant here. The thresholds below are widely used
 * LENDER CONVENTIONS, not law. The single legal reference point is the
 * Qualified Mortgage (QM) back-end limit of 43%, set by the Consumer Financial
 * Protection Bureau under the Ability-to-Repay rule (12 CFR 1026.43,
 * effective 2014). It is a safe-harbour threshold for lenders, not a hard cap
 * on borrowers.
 */

// Front-end (housing only) ratio at or below this is considered ideal by most
// conventional lenders.
export const FRONT_END_IDEAL_MAX = 28;

// Back-end (all debt) ratio at or below this is the classic conventional
// comfort zone.
export const BACK_END_IDEAL_MAX = 36;

// Back-end ratio at or below this still qualifies under the CFPB Qualified
// Mortgage Ability-to-Repay rule (43%). Above it is treated as high risk.
export const BACK_END_QM_MAX = 43;

export interface DebtToIncomeInputs {
  // Gross (pre-tax) income per month.
  grossMonthlyIncome: number;
  // Total monthly housing payment: mortgage or rent plus property tax,
  // insurance, HOA and PMI where they apply.
  housingPayment: number;
  // All other recurring monthly debt: car loans, student loans, credit card
  // minimums, personal loans, child support.
  otherMonthlyDebts: number;
}

// Plain-English rating buckets for the back-end ratio.
export type DTIRating = 'ideal' | 'acceptable' | 'caution' | 'high';

export interface DebtToIncomeResult {
  // Front-end ratio as a percentage, for example 25 means 25 percent.
  frontDTI: number;
  // Back-end ratio as a percentage.
  backDTI: number;
  // Total monthly debt used in the back-end ratio.
  totalMonthlyDebt: number;
  // Rating of the back-end ratio against conventional lender thresholds.
  rating: DTIRating;
  // Short human-readable summary of the rating.
  ratingLabel: string;
  // True when the back-end ratio is within the conventional 36 percent zone.
  isWithinConventional: boolean;
  // True when the back-end ratio is within the 43 percent Qualified Mortgage limit.
  isWithinQualifiedMortgage: boolean;
}

/**
 * Map a back-end DTI percentage to a plain-English rating against the
 * conventional lender thresholds. Front-end is judged separately by the caller
 * but the back-end ratio is the headline figure lenders lead with.
 */
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

/**
 * Round a number to one decimal place. DTI is conventionally quoted to a
 * tenth of a percent.
 */
function roundTo1dp(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Main pure calculation. Negative inputs are floored at zero so a cleared
 * field cannot produce a nonsensical ratio. When gross income is zero the
 * ratios are reported as zero rather than dividing by zero.
 */
export function calculateDebtToIncome(inputs: DebtToIncomeInputs): DebtToIncomeResult {
  const grossMonthlyIncome = Math.max(0, inputs.grossMonthlyIncome);
  const housingPayment = Math.max(0, inputs.housingPayment);
  const otherMonthlyDebts = Math.max(0, inputs.otherMonthlyDebts);

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

/**
 * Sensible starting inputs: a 6,000 dollar monthly gross income with a 1,500
 * dollar housing payment and 500 dollars of other debt. Yields a 25 percent
 * front and 33.3 percent back ratio, both inside the conventional zone.
 */
export function getDefaultInputs(): DebtToIncomeInputs {
  return {
    grossMonthlyIncome: 6000,
    housingPayment: 1500,
    otherMonthlyDebts: 500,
  };
}
