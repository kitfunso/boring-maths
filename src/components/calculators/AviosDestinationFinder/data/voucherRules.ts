/** BA Amex Companion Voucher rules (2-traveller 2-for-1 only; solo 50% variant not modeled). Doc-only reference, not consumed by code: calculatePartyTotals and voucherApplies encode this directly. Sources: docs/ARCHITECTURE.md. */
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
