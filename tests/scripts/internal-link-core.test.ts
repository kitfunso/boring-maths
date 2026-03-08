import { describe, expect, it } from 'vitest';
import {
  buildInternalLinkMap,
  similarityBetweenPages,
  summariseInternalLinkMap,
} from '../../scripts/seo/internal-link-core.mjs';

describe('internal link map core', () => {
  const pages = [
    {
      slug: 'uk-tax-calculator',
      url: '/calculators/uk-tax-calculator',
      title: 'UK Tax Calculator',
      keywords: 'uk tax calculator, income tax, take home pay',
    },
    {
      slug: 'uk-dividend-tax-calculator',
      url: '/calculators/uk-dividend-tax-calculator',
      title: 'UK Dividend Tax Calculator',
      keywords: 'uk dividend tax calculator, dividend tax, uk tax',
    },
    {
      slug: 'bbq-calculator',
      url: '/calculators/bbq-calculator',
      title: 'BBQ Calculator',
      keywords: 'bbq food calculator, meat per person',
    },
  ];

  it('scores related pages higher than unrelated ones', () => {
    const taxVsDividend = similarityBetweenPages(pages[0], pages[1]).similarity;
    const taxVsBbq = similarityBetweenPages(pages[0], pages[2]).similarity;

    expect(taxVsDividend).toBeGreaterThan(taxVsBbq);
  });

  it('builds semantic links and excludes random ones', () => {
    const links = buildInternalLinkMap(pages, {
      maxLinksPerPage: 2,
      minSimilarity: 0.2,
    });

    const taxLinks = links.filter((row) => row.source_url === '/calculators/uk-tax-calculator');

    expect(taxLinks.length).toBeGreaterThan(0);
    expect(taxLinks.some((row) => row.target_url === '/calculators/uk-dividend-tax-calculator')).toBe(true);
    expect(taxLinks.some((row) => row.target_url === '/calculators/bbq-calculator')).toBe(false);
  });

  it('respects max links per page', () => {
    const links = buildInternalLinkMap(
      [
        ...pages,
        {
          slug: 'uk-salary-sacrifice-calculator',
          url: '/calculators/uk-salary-sacrifice-calculator',
          title: 'UK Salary Sacrifice Calculator',
          keywords: 'uk salary sacrifice tax calculator, pension tax',
        },
      ],
      {
        maxLinksPerPage: 1,
        minSimilarity: 0.15,
      },
    );

    const counts = links.reduce((acc, row) => {
      acc[row.source_url] = (acc[row.source_url] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.values(counts).forEach((count) => expect(count).toBeLessThanOrEqual(1));
  });

  it('summarises links per source page', () => {
    const links = buildInternalLinkMap(pages, {
      maxLinksPerPage: 2,
      minSimilarity: 0.2,
    });

    const summary = summariseInternalLinkMap(links);
    expect(summary.length).toBeGreaterThan(0);
    expect(summary[0]).toHaveProperty('source_url');
    expect(summary[0]).toHaveProperty('target_urls');
  });
});
