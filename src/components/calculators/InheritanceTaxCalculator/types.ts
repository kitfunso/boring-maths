/**
 * UK Inheritance Tax Calculator Types
 */

export interface IHTInputs {
  estateValue: number;
  mainResidenceValue: number;
  leavingToDirectDescendants: boolean;
  marriedOrCivilPartner: boolean;
  spouseInheritingEstate: boolean;
  giftsInLast7Years: number;
  charitableDonation: number;
}

export interface IHTResult {
  taxableEstate: number;
  totalNilRateBand: number;
  nilRateBand: number;
  residenceNilRateBand: number;
  transferredNilRateBand: number;
  transferredResidenceNilRateBand: number;
  charitableDeduction: number;
  ihtDue: number;
  effectiveRate: number;
  taxRate: number;
  netEstate: number;
}

export function getDefaultInputs(): IHTInputs {
  return {
    estateValue: 500000,
    mainResidenceValue: 250000,
    leavingToDirectDescendants: true,
    marriedOrCivilPartner: false,
    spouseInheritingEstate: false,
    giftsInLast7Years: 0,
    charitableDonation: 0,
  };
}
