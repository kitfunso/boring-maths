/**
 * France Net Salary Calculations (2026)
 *
 * Computes net salary AVANT impot sur le revenu (before income tax / prelevement
 * a la source). French income tax is withheld at source separately and depends on
 * the whole household, so it is not part of this employee-contribution model.
 *
 * Rates and the social security ceiling (PMSS) are 2026 statutory figures from
 * CALC-SPEC-US-EU.md (URSSAF / legisocial / Agirc-Arrco 2026).
 * Pure TypeScript, no Preact import, so it can be unit tested in isolation.
 */

export type FranceStatus = 'non-cadre' | 'cadre';

export interface FranceSalaryInputs {
  grossAnnualSalary: number;
  status: FranceStatus;
}

export interface FranceSalaryResult {
  grossAnnualSalary: number;
  status: FranceStatus;
  totalContributions: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number;
}

// Plafond de la Securite sociale 2026: 3925/mo * 12.
export const PMSS_ANNUAL = 47100;

// Vieillesse (old-age pension), employee share.
export const VIEILLESSE_PLAFONNEE_RATE = 0.069; // 6.90% on tranche 1 (up to 1 PMSS)
export const VIEILLESSE_DEPLAFONNEE_RATE = 0.004; // 0.40% on full gross

// CSG / CRDS applied to 98.25% of gross (1.75% abattement up to 4 PMSS).
export const CSG_CRDS_ABATTEMENT = 0.9825;
export const CSG_ABATTEMENT_CEILING_MULTIPLE = 4; // abattement only up to 4 PMSS
export const CSG_DEDUCTIBLE_RATE = 0.068; // 6.80%
export const CSG_NON_DEDUCTIBLE_RATE = 0.024; // 2.40%
export const CRDS_RATE = 0.005; // 0.50%

// Agirc-Arrco complementary pension, employee share.
export const AGIRC_ARRCO_T1_RATE = 0.0315; // 3.15% on tranche 1
export const AGIRC_ARRCO_T2_RATE = 0.0864; // 8.64% on tranche 2 (1 to 8 PMSS)

// CEG (Contribution d'Equilibre General), employee share.
export const CEG_T1_RATE = 0.0086; // 0.86% on tranche 1
export const CEG_T2_RATE = 0.0108; // 1.08% on tranche 2

// CET (Contribution d'Equilibre Technique): only when gross > 1 PMSS, on T1 + T2.
export const CET_RATE = 0.0014; // 0.14%

// APEC (cadre only): 0.024% up to 4 PMSS.
export const APEC_RATE = 0.00024;
export const APEC_CEILING_MULTIPLE = 4;

// Tranche 2 spans 1 PMSS to 8 PMSS.
export const TRANCHE_2_CEILING_MULTIPLE = 8;

export function getDefaultInputs(): FranceSalaryInputs {
  return {
    grossAnnualSalary: 45000,
    status: 'non-cadre',
  };
}

/**
 * Total employee contributions for a given gross and status.
 * Note: employee assurance chomage and assurance maladie (general regime) are 0%
 * and intentionally NOT deducted.
 */
function calculateContributions(gross: number, status: FranceStatus): number {
  if (gross <= 0) return 0;

  const tranche1 = Math.min(gross, PMSS_ANNUAL);
  const tranche2 = Math.max(
    0,
    Math.min(gross, TRANCHE_2_CEILING_MULTIPLE * PMSS_ANNUAL) - PMSS_ANNUAL
  );

  const csgCeiling = CSG_ABATTEMENT_CEILING_MULTIPLE * PMSS_ANNUAL;
  const csgBase =
    gross <= csgCeiling
      ? gross * CSG_CRDS_ABATTEMENT
      : csgCeiling * CSG_CRDS_ABATTEMENT + (gross - csgCeiling);

  const vieillesse = tranche1 * VIEILLESSE_PLAFONNEE_RATE + gross * VIEILLESSE_DEPLAFONNEE_RATE;
  const csgCrds = csgBase * (CSG_DEDUCTIBLE_RATE + CSG_NON_DEDUCTIBLE_RATE + CRDS_RATE);
  const agircArrco = tranche1 * AGIRC_ARRCO_T1_RATE + tranche2 * AGIRC_ARRCO_T2_RATE;
  const ceg = tranche1 * CEG_T1_RATE + tranche2 * CEG_T2_RATE;
  const cet = gross > PMSS_ANNUAL ? (tranche1 + tranche2) * CET_RATE : 0;
  const apec =
    status === 'cadre' ? Math.min(gross, APEC_CEILING_MULTIPLE * PMSS_ANNUAL) * APEC_RATE : 0;

  return vieillesse + csgCrds + agircArrco + ceg + cet + apec;
}

export function calculateFranceSalary(inputs: FranceSalaryInputs): FranceSalaryResult {
  const gross = Math.max(0, inputs.grossAnnualSalary || 0);
  const status = inputs.status === 'cadre' ? 'cadre' : 'non-cadre';

  const totalContributions = calculateContributions(gross, status);
  const netAnnual = gross - totalContributions;
  const netMonthly = netAnnual / 12;
  const effectiveRate = gross > 0 ? (totalContributions / gross) * 100 : 0;

  return {
    grossAnnualSalary: gross,
    status,
    totalContributions,
    netAnnual,
    netMonthly,
    effectiveRate,
  };
}
