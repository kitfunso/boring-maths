import { describe, it, expect } from 'vitest';
import { getAlternates, LOCALE_BY_COUNTRY } from '@/lib/hreflang';
import { calculators } from '@/lib/calculators';

const FAMILY_HREFS = [
  [
    '/calculators/uk-tax-calculator/',
    '/calculators/us-paycheck-calculator/',
    '/calculators/singapore-take-home-pay-calculator/',
  ],
  ['/calculators/uk-employer-cost-calculator/', '/calculators/singapore-employer-cost-calculator/'],
  ['/calculators/us-sales-tax-calculator/', '/calculators/singapore-gst-calculator/'],
];

const ALLOWED_LOCALES = new Set(['en-GB', 'en-US', 'en-SG']);
const registryByHref = new Map(calculators.map((c) => [c.href, c]));

describe('getAlternates', () => {
  it('is reciprocal and self-referencing for every family member', () => {
    for (const family of FAMILY_HREFS) {
      for (const href of family) {
        const alternates = getAlternates(href).map((a) => a.href);
        expect(new Set(alternates)).toEqual(new Set(family));
      }
    }
  });

  it('never emits an invalid region code', () => {
    for (const family of FAMILY_HREFS) {
      for (const href of family) {
        for (const alt of getAlternates(href)) {
          expect(ALLOWED_LOCALES.has(alt.hreflang)).toBe(true);
          expect(alt.hreflang).not.toBe('en-UK');
          expect(alt.hreflang).not.toBe('en-EU');
        }
      }
    }
  });

  it('every family href resolves to a live registry entry', () => {
    for (const family of FAMILY_HREFS) {
      for (const href of family) {
        expect(registryByHref.has(href), `missing registry entry: ${href}`).toBe(true);
      }
    }
  });

  it('each declared locale matches the registry country', () => {
    for (const family of FAMILY_HREFS) {
      for (const href of family) {
        const entry = registryByHref.get(href);
        const alt = getAlternates(href).find((a) => a.href === href);
        expect(entry?.country && LOCALE_BY_COUNTRY[entry.country]).toBe(alt?.hreflang);
      }
    }
  });

  it('returns [] for non-family paths, including undefined and empty string', () => {
    expect(getAlternates('/calculators/tip-calculator/')).toEqual([]);
    expect(getAlternates('/guides/best-baby-family-calculators/')).toEqual([]);
    expect(getAlternates('')).toEqual([]);
    expect(getAlternates(undefined)).toEqual([]);
  });

  it('every non-null LOCALE_BY_COUNTRY value is a valid, non-reserved locale', () => {
    const RESERVED_REGIONS = new Set(['UK', 'EU', 'UN']);
    for (const locale of Object.values(LOCALE_BY_COUNTRY)) {
      if (locale === null) continue;
      expect(locale).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
      const region = locale.split('-')[1];
      expect(RESERVED_REGIONS.has(region)).toBe(false);
    }
  });
});
