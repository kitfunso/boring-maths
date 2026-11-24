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

export const PMSS_ANNUAL = 48060;

export const VIEILLESSE_PLAFONNEE_RATE = 0.069;
export const VIEILLESSE_DEPLAFONNEE_RATE = 0.004;
export const CSG_CRDS_ABATTEMENT = 0.9825;
export const CSG_ABATTEMENT_CEILING_MULTIPLE = 4;
export const CSG_DEDUCTIBLE_RATE = 0.068;
export const CSG_NON_DEDUCTIBLE_RATE = 0.024;
export const CRDS_RATE = 0.005;
export const AGIRC_ARRCO_T1_RATE = 0.0315;
export const AGIRC_ARRCO_T2_RATE = 0.0864;
export const CEG_T1_RATE = 0.0086;
export const CEG_T2_RATE = 0.0108;
export const CET_RATE = 0.0014;
export const APEC_RATE = 0.00024;
export const APEC_CEILING_MULTIPLE = 4;

export const TRANCHE_2_CEILING_MULTIPLE = 8;

export function getDefaultInputs(): FranceSalaryInputs {
  return {
    grossAnnualSalary: 45000,
    status: 'non-cadre',
  };
}

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
