import { describe, expect, it } from 'vitest';
import {
  buildRefreshOpportunities,
  coverageForQuery,
  summariseRefreshOpportunities,
  toUrlPath,
} from '../../scripts/seo/gsc-refresh-core.mjs';

describe('gsc refresh core', () => {
  it('normalises full URL to pathname', () => {
    expect(toUrlPath('https://boring-math.com/calculators/uk-tax-calculator')).toBe(
      '/calculators/uk-tax-calculator'
    );
  });

  it('detects missing query terms from page text', () => {
    const coverage = coverageForQuery(
      'uk dividend tax calculator',
      'UK tax calculator with income tax bands and examples'
    );

    expect(coverage.coverage_ratio).toBeLessThan(1);
    expect(coverage.missing_terms).toContain('dividend');
  });

  it('builds opportunities for under-covered queries only', () => {
    const rows = [
      {
        page: '/calculators/uk-tax-calculator',
        query: 'uk dividend tax calculator',
        impressions: '500',
        clicks: '20',
        position: '12',
      },
      {
        page: '/calculators/uk-tax-calculator',
        query: 'uk tax calculator',
        impressions: '600',
        clicks: '80',
        position: '8',
      },
      {
        page: '/calculators/uk-tax-calculator',
        query: 'uk tax rates',
        impressions: '10',
        clicks: '1',
        position: '14',
      },
    ];

    const pageTextByPath = {
      '/calculators/uk-tax-calculator': 'uk tax calculator with income tax bands and rates',
    };

    const opportunities = buildRefreshOpportunities(rows, pageTextByPath, {
      minImpressions: 50,
      maxCoverage: 0.8,
    });

    expect(opportunities).toHaveLength(1);
    expect(opportunities[0].query).toBe('uk dividend tax calculator');
    expect(opportunities[0].missing_terms).toContain('dividend');
  });

  it('summarises opportunities by page with top missing terms', () => {
    const summary = summariseRefreshOpportunities([
      {
        page_url: '/calculators/uk-tax-calculator',
        query: 'uk dividend tax calculator',
        impressions: 500,
        clicks: 20,
        position: 12,
        coverage_ratio: 0.75,
        missing_terms: 'dividend',
        opportunity_score: 70,
      },
      {
        page_url: '/calculators/uk-tax-calculator',
        query: 'uk self assessment tax calculator',
        impressions: 400,
        clicks: 15,
        position: 15,
        coverage_ratio: 0.7,
        missing_terms: 'self | assessment',
        opportunity_score: 66,
      },
    ]);

    expect(summary).toHaveLength(1);
    expect(summary[0].opportunity_count).toBe(2);
    expect(summary[0].top_missing_terms).toContain('dividend');
  });
});
