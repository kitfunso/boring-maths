import { withTrailingSlash } from './url';
import type { CountryCode } from './calculators';

export const LOCALE_BY_COUNTRY: Record<CountryCode, string | null> = {
  UK: 'en-GB',
  US: 'en-US',
  SG: 'en-SG',
  EU: null,
};

export interface FamilyMember {
  href: string;
  country: CountryCode;
}

// UK and EU are reserved codes Google ignores; GB is the UK's real region code.
export const FAMILIES: FamilyMember[][] = [
  [
    { href: '/calculators/uk-tax-calculator/', country: 'UK' },
    { href: '/calculators/us-paycheck-calculator/', country: 'US' },
    { href: '/calculators/singapore-take-home-pay-calculator/', country: 'SG' },
  ],
  [
    { href: '/calculators/uk-employer-cost-calculator/', country: 'UK' },
    { href: '/calculators/singapore-employer-cost-calculator/', country: 'SG' },
  ],
  [
    { href: '/calculators/us-sales-tax-calculator/', country: 'US' },
    { href: '/calculators/singapore-gst-calculator/', country: 'SG' },
  ],
  [
    { href: '/calculators/uk-stamp-duty-calculator/', country: 'UK' },
    { href: '/calculators/singapore-stamp-duty-calculator/', country: 'SG' },
  ],
  [
    { href: '/calculators/us-tax-bracket-calculator/', country: 'US' },
    { href: '/calculators/singapore-income-tax-calculator/', country: 'SG' },
  ],
];

export function getAlternates(
  pathname: string | undefined | null
): { hreflang: string; href: string }[] {
  if (!pathname) return [];
  const path = withTrailingSlash(pathname);
  const family = FAMILIES.find((f) => f.some((m) => m.href === path));
  if (!family) return [];
  return family
    .map((m) => ({ hreflang: LOCALE_BY_COUNTRY[m.country], href: m.href }))
    .filter((a): a is { hreflang: string; href: string } => a.hreflang !== null);
}
