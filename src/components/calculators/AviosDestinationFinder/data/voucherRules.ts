/**
 * BA Amex Companion Voucher rules used by this finder.
 * Sources (fetched 2026-07-19):
 * - https://www.headforpoints.com/2026/01/03/how-do-british-airways-american-express-241-companion-vouchers-work/
 * - BA T&Cs: britishairways.com .../gb-companion-voucher-terms
 * v1 models the 2-traveller 2-for-1 only; the solo 50% variant is v2.
 * Doc-only reference data - not consumed by code. calculatePartyTotals
 * encodes the voucher rule directly; editing this file does not change
 * runtime behaviour.
 */
export const VOUCHER_RULES = {
  /** Second seat on the same reward booking costs no Avios. */
  secondSeatAviosFree: true,
  /** Taxes, fees and charges remain payable for BOTH passengers. */
  cashPayableForBoth: true,
  /** Works on British Airways, Iberia and Aer Lingus reward seats; not codeshares. */
  airlines: ['British Airways', 'Iberia', 'Aer Lingus'] as const,
  /** Free BA Amex voucher: economy only, valid 1 year. Premium Plus: all cabins, 2 years. */
  freeCardEconomyOnly: true,
  premiumPlusAllCabins: true,
} as const;
