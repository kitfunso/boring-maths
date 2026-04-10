/**
 * Affiliate Partner Configuration
 *
 * Central registry mapping calculator slugs to contextual affiliate recommendations.
 * Used by AffiliateBox component on financial calculator pages.
 */

export interface AffiliatePartner {
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly cta: string;
  /** Emoji icon for display */
  readonly icon: string;
  /** Tracking identifier for this partner */
  readonly partner: string;
}

export interface AffiliateConfig {
  readonly title: string;
  readonly partners: readonly AffiliatePartner[];
}

/** Affiliate recommendations keyed by calculator slug */
const affiliateRegistry: Readonly<Record<string, AffiliateConfig>> = {
  'mortgage-calculator': {
    title: 'Compare Mortgage Deals',
    partners: [
      {
        name: 'Habito',
        description: 'Free online mortgage broker. Compare 20,000+ deals from 90+ lenders.',
        url: '#affiliate-habito',
        cta: 'Compare Deals',
        icon: '\u{1F3E0}',
        partner: 'habito',
      },
      {
        name: 'London & Country',
        description: "Fee-free mortgage advice from the UK's largest fee-free broker.",
        url: '#affiliate-landc',
        cta: 'Get Free Advice',
        icon: '\u{1F4B7}',
        partner: 'landc',
      },
    ],
  },
  'uk-pension-calculator': {
    title: 'Manage Your Pension',
    partners: [
      {
        name: 'PensionBee',
        description:
          'Combine your old pensions into one easy plan. Award-winning pension provider.',
        url: '#affiliate-pensionbee',
        cta: 'Consolidate Pensions',
        icon: '\u{1F41D}',
        partner: 'pensionbee',
      },
      {
        name: 'Moneybox',
        description: 'Pensions, ISAs and investments in one app. Workplace pension included.',
        url: '#affiliate-moneybox',
        cta: 'Start Saving',
        icon: '\u{1F4B0}',
        partner: 'moneybox',
      },
    ],
  },
  'uk-100k-tax-trap-calculator': {
    title: 'Optimise Your Tax Position',
    partners: [
      {
        name: 'Unbiased',
        description: 'Find a qualified financial adviser near you. Free matching service.',
        url: '#affiliate-unbiased',
        cta: 'Find an Adviser',
        icon: '\u{1F3AF}',
        partner: 'unbiased',
      },
      {
        name: 'PensionBee',
        description: 'Salary sacrifice into your pension to avoid the 60% tax trap.',
        url: '#affiliate-pensionbee-tax',
        cta: 'Boost Your Pension',
        icon: '\u{1F41D}',
        partner: 'pensionbee',
      },
    ],
  },
  'compound-interest-calculator': {
    title: 'Start Investing',
    partners: [
      {
        name: 'Vanguard',
        description: 'Low-cost index funds and ISAs. Invest from \u00A3500 or \u00A3100/month.',
        url: '#affiliate-vanguard',
        cta: 'Open an ISA',
        icon: '\u{1F4C8}',
        partner: 'vanguard',
      },
      {
        name: 'Trading 212',
        description: 'Commission-free stocks and shares ISA. Fractional shares from \u00A31.',
        url: '#affiliate-trading212',
        cta: 'Start Investing',
        icon: '\u{1F4CA}',
        partner: 'trading212',
      },
    ],
  },
  'uk-stamp-duty-calculator': {
    title: 'Buying a Property?',
    partners: [
      {
        name: 'Habito',
        description: 'Get mortgage-ready before you buy. Compare 20,000+ deals.',
        url: '#affiliate-habito-sdlt',
        cta: 'Get Pre-Approved',
        icon: '\u{1F3E0}',
        partner: 'habito',
      },
    ],
  },
  'sdlt-calculator': {
    title: 'Buying in England?',
    partners: [
      {
        name: 'Habito',
        description: 'Free online mortgage broker for England & Northern Ireland.',
        url: '#affiliate-habito-eng',
        cta: 'Compare Mortgages',
        icon: '\u{1F3E0}',
        partner: 'habito',
      },
    ],
  },
  'inheritance-tax-calculator': {
    title: 'Estate Planning Help',
    partners: [
      {
        name: 'Unbiased',
        description: 'Find a qualified IHT specialist or estate planner near you.',
        url: '#affiliate-unbiased-iht',
        cta: 'Find a Specialist',
        icon: '\u{1F4CB}',
        partner: 'unbiased',
      },
    ],
  },
  'fire-calculator': {
    title: 'Build Your FIRE Portfolio',
    partners: [
      {
        name: 'Vanguard',
        description: 'Low-cost index funds ideal for long-term FIRE investors.',
        url: '#affiliate-vanguard-fire',
        cta: 'Open an ISA',
        icon: '\u{1F525}',
        partner: 'vanguard',
      },
      {
        name: 'Trading 212',
        description: 'Commission-free investing. Build your FIRE portfolio from \u00A31.',
        url: '#affiliate-trading212-fire',
        cta: 'Start Investing',
        icon: '\u{1F4CA}',
        partner: 'trading212',
      },
    ],
  },
  'loan-calculator': {
    title: 'Compare Loan Options',
    partners: [
      {
        name: 'Freedom Finance',
        description: 'Compare personal loans from multiple UK lenders. Soft credit check.',
        url: '#affiliate-freedom',
        cta: 'Compare Loans',
        icon: '\u{1F4B7}',
        partner: 'freedom-finance',
      },
    ],
  },
  'savings-goal-calculator': {
    title: 'Boost Your Savings',
    partners: [
      {
        name: 'Moneybox',
        description:
          'Round up your spare change and save automatically. Stocks & Shares ISA included.',
        url: '#affiliate-moneybox-save',
        cta: 'Start Saving',
        icon: '\u{1F4B0}',
        partner: 'moneybox',
      },
    ],
  },
  'uk-salary-sacrifice-calculator': {
    title: 'Maximise Salary Sacrifice',
    partners: [
      {
        name: 'PensionBee',
        description: 'Easy pension management. See the impact of extra contributions.',
        url: '#affiliate-pensionbee-ss',
        cta: 'Check Your Pension',
        icon: '\u{1F41D}',
        partner: 'pensionbee',
      },
    ],
  },
  'uk-dividend-tax-calculator': {
    title: 'Manage Your Investments',
    partners: [
      {
        name: 'Trading 212',
        description:
          'Commission-free dividend investing. Stocks & Shares ISA shelters dividends from tax.',
        url: '#affiliate-trading212-div',
        cta: 'Open ISA',
        icon: '\u{1F4CA}',
        partner: 'trading212',
      },
    ],
  },
  'uk-capital-gains-tax-calculator': {
    title: 'Tax-Efficient Investing',
    partners: [
      {
        name: 'Vanguard',
        description: 'Shelter gains in an ISA. Low-cost funds with no CGT on growth.',
        url: '#affiliate-vanguard-cgt',
        cta: 'Open an ISA',
        icon: '\u{1F4C8}',
        partner: 'vanguard',
      },
    ],
  },
};

/**
 * Get affiliate recommendations for a calculator page.
 * Returns null if no affiliates are configured for this calculator.
 */
export function getAffiliatesForCalculator(slug: string): AffiliateConfig | null {
  return affiliateRegistry[slug] ?? null;
}

/** Get all calculator slugs that have affiliate config */
export function getAffiliatedCalculatorSlugs(): readonly string[] {
  return Object.keys(affiliateRegistry);
}
