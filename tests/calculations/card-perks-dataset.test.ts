/** Card Perks dataset tests: verifies CARDS/pointValues satisfy the shared contract, not the UI or math. */

import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/components/calculators/CardPerksCalculator/data/cards';
import {
  DEFAULT_POINT_VALUE_PENCE,
  VOUCHER_BENCHMARK,
  VOUCHER_BENCHMARK_AVIOS,
  DEFAULT_VOUCHER_VALUE,
  resolveVoucherBenchmarkAvios,
  DATA_LAST_VERIFIED,
} from '../../src/components/calculators/CardPerksCalculator/data/pointValues';
import { NOT_OFFERED } from '../../src/components/calculators/AviosDestinationFinder/types';
import type { Destination } from '../../src/components/calculators/AviosDestinationFinder/types';

// Hardcoded so this test does not need a runtime import from types.ts (owned by Task 1).
const VALID_TYPES = ['credit', 'charge', 'debit', 'bnpl', 'plan'] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TODAY = new Date().toISOString().slice(0, 10);

describe('CardProduct dataset', () => {
  it('has at least 20 rows', () => {
    expect(CARDS.length).toBeGreaterThanOrEqual(20);
  });

  it('has unique, kebab-case ids', () => {
    const ids = CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(KEBAB_CASE);
  });

  it('every sourceUrl starts with https://', () => {
    for (const c of CARDS) expect(c.sourceUrl.startsWith('https://')).toBe(true);
  });

  it('every lastVerified is ISO and not in the future', () => {
    for (const c of CARDS) {
      expect(c.lastVerified).toMatch(ISO_DATE);
      expect(c.lastVerified <= TODAY).toBe(true);
    }
  });

  it('fee.year1 <= fee.ongoing', () => {
    for (const c of CARDS) {
      expect(c.fee.year1).toBeGreaterThanOrEqual(0);
      expect(c.fee.ongoing).toBeGreaterThanOrEqual(0);
      expect(c.fee.year1).toBeLessThanOrEqual(c.fee.ongoing);
    }
  });

  it('representativeApr is null for debit, plan and bnpl; a positive number for credit', () => {
    for (const c of CARDS) {
      if (c.type === 'debit' || c.type === 'plan' || c.type === 'bnpl') {
        expect(c.representativeApr).toBeNull();
      }
      if (c.type === 'credit') {
        expect(c.representativeApr).not.toBeNull();
        expect(c.representativeApr as number).toBeGreaterThan(0);
      }
    }
  });

  it('section75 is true only for credit and charge rows', () => {
    for (const c of CARDS) {
      if (c.type === 'credit' || c.type === 'charge') continue;
      expect(c.section75).toBe(false);
    }
  });

  it('every card type is one of the valid types', () => {
    for (const c of CARDS) expect(VALID_TYPES).toContain(c.type);
  });

  it('earn values are between 0 and 10', () => {
    for (const c of CARDS) {
      for (const v of Object.values(c.earn)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(10);
      }
    }
  });

  it('fxFeePct is between 0 and 5', () => {
    for (const c of CARDS) {
      expect(c.fxFeePct).toBeGreaterThanOrEqual(0);
      expect(c.fxFeePct).toBeLessThanOrEqual(5);
    }
  });

  it('lounge.visitsPerYear is null or at least 1', () => {
    for (const c of CARDS) {
      if (!c.lounge) continue;
      expect(c.lounge.visitsPerYear === null || c.lounge.visitsPerYear >= 1).toBe(true);
    }
  });

  it('cashback welcome bonuses are in pence and match a GBP figure in their note', () => {
    for (const c of CARDS) {
      if (c.currency !== 'cashback' || c.welcomeBonus === null || c.welcomeBonus.units === 0)
        continue;
      const gbpFigures = [...c.welcomeBonus.note.matchAll(/GBP([\d,]+(?:\.\d+)?)/g)].map((m) =>
        Math.round(Number(m[1].replace(/,/g, '')) * 100)
      );
      expect(gbpFigures, c.id).toContain(c.welcomeBonus.units);
    }
  });

  it('introRatePct is set only on cashback cards, between 0 and 10', () => {
    for (const c of CARDS) {
      if (c.welcomeBonus === null || c.welcomeBonus.introRatePct === null) continue;
      expect(c.currency, c.id).toBe('cashback');
      expect(c.welcomeBonus.introRatePct, c.id).toBeGreaterThan(0);
      expect(c.welcomeBonus.introRatePct, c.id).toBeLessThanOrEqual(10);
    }
  });

  it('purchaseApr is set for every credit row, null elsewhere, and never above 60', () => {
    for (const c of CARDS) {
      if (c.type !== 'credit') {
        expect(c.purchaseApr, c.id).toBeNull();
        continue;
      }
      expect(c.purchaseApr, c.id).not.toBeNull();
      expect(c.purchaseApr as number, c.id).toBeGreaterThan(0);
      expect(c.purchaseApr as number, c.id).toBeLessThanOrEqual(60);
    }
  });

  it('every PointCurrency in use has a positive default value, except none', () => {
    const inUse = new Set(CARDS.map((c) => c.currency));
    for (const currency of inUse) {
      if (currency === 'none') continue;
      expect(DEFAULT_POINT_VALUE_PENCE[currency]).toBeGreaterThan(0);
    }
  });
});

describe('voucher benchmark', () => {
  it('VOUCHER_BENCHMARK_AVIOS is positive', () => {
    expect(VOUCHER_BENCHMARK_AVIOS).toBeGreaterThan(0);
  });

  it('DEFAULT_VOUCHER_VALUE is positive', () => {
    expect(DEFAULT_VOUCHER_VALUE).toBeGreaterThan(0);
  });

  it('throws naming the city when the benchmark row is missing', () => {
    expect(() => resolveVoucherBenchmarkAvios([])).toThrowError(new RegExp(VOUCHER_BENCHMARK.city));
  });

  it('throws naming the city when the benchmark cabin is NOT_OFFERED', () => {
    const fixture: Destination[] = [
      {
        city: VOUCHER_BENCHMARK.city,
        iata: 'JFK',
        country: 'United States',
        region: 'North America',
        holidayTypes: ['city'],
        economy: NOT_OFFERED,
        premiumEconomy: NOT_OFFERED,
        business: NOT_OFFERED,
      },
    ];
    expect(() => resolveVoucherBenchmarkAvios(fixture)).toThrowError(
      new RegExp(VOUCHER_BENCHMARK.city)
    );
  });
});

describe('DATA_LAST_VERIFIED', () => {
  it('matches the newest lastVerified across CARDS', () => {
    const max = CARDS.reduce(
      (m, c) => (c.lastVerified > m ? c.lastVerified : m),
      CARDS[0].lastVerified
    );
    expect(DATA_LAST_VERIFIED).toBe(max);
  });
});
