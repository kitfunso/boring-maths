// 2026 US federal figures shared by every US calculator, so the yearly refresh is one file.
// Sources: Rev. Proc. 2025-32 (sections 4.01, 4.14) and the SSA contribution and benefit base page.

export type FederalFilingStatus =
  | 'single'
  | 'married_jointly'
  | 'married_separately'
  | 'head_of_household';

export interface FederalBracket {
  readonly min: number;
  readonly max: number;
  readonly rate: number; // percent, 22 means 22%
}

export const FEDERAL_TAX_YEAR = 2026;

export const FEDERAL_BRACKETS_2026: Readonly<
  Record<FederalFilingStatus, readonly FederalBracket[]>
> = {
  single: [
    { min: 0, max: 12400, rate: 10 },
    { min: 12400, max: 50400, rate: 12 },
    { min: 50400, max: 105700, rate: 22 },
    { min: 105700, max: 201775, rate: 24 },
    { min: 201775, max: 256225, rate: 32 },
    { min: 256225, max: 640600, rate: 35 },
    { min: 640600, max: Infinity, rate: 37 },
  ],
  married_jointly: [
    { min: 0, max: 24800, rate: 10 },
    { min: 24800, max: 100800, rate: 12 },
    { min: 100800, max: 211400, rate: 22 },
    { min: 211400, max: 403550, rate: 24 },
    { min: 403550, max: 512450, rate: 32 },
    { min: 512450, max: 768700, rate: 35 },
    { min: 768700, max: Infinity, rate: 37 },
  ],
  married_separately: [
    { min: 0, max: 12400, rate: 10 },
    { min: 12400, max: 50400, rate: 12 },
    { min: 50400, max: 105700, rate: 22 },
    { min: 105700, max: 201775, rate: 24 },
    { min: 201775, max: 256225, rate: 32 },
    { min: 256225, max: 384350, rate: 35 },
    { min: 384350, max: Infinity, rate: 37 },
  ],
  head_of_household: [
    { min: 0, max: 17700, rate: 10 },
    { min: 17700, max: 67450, rate: 12 },
    { min: 67450, max: 105700, rate: 22 },
    { min: 105700, max: 201750, rate: 24 },
    { min: 201750, max: 256200, rate: 32 },
    { min: 256200, max: 640600, rate: 35 },
    { min: 640600, max: Infinity, rate: 37 },
  ],
};

export const STANDARD_DEDUCTION_2026: Readonly<Record<FederalFilingStatus, number>> = {
  single: 16100,
  married_jointly: 32200,
  married_separately: 16100,
  head_of_household: 24150,
};

export const SOCIAL_SECURITY_WAGE_BASE_2026 = 184500;
