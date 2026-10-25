import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { calculators } from '@/lib/calculators';
import { checkPage, dateProblem, scanSources } from '../../scripts/seo/check-sources-fresh.mjs';
import { auditPages, parseRegistry } from '../../scripts/seo/check-noindex.mjs';
import { fillDailySeries, findCliff } from '../../scripts/seo/gsc-daily-core.mjs';

describe('check-sources-fresh dateProblem', () => {
  const now = Date.UTC(2026, 9, 25, 12); // 2026-10-25 midday UTC

  it('accepts today and recent dates', () => {
    expect(dateProblem('2026-10-25', now)).toBeNull();
    expect(dateProblem('2026-10-01', now)).toBeNull();
  });

  it('rejects dates that are not on the calendar', () => {
    expect(dateProblem('2026-99-99', now)).toMatch(/not a real calendar date/);
    expect(dateProblem('2026-02-30', now)).toMatch(/not a real calendar date/);
    expect(dateProblem('2026-13-01', now)).toMatch(/not a real calendar date/);
  });

  it('rejects future dates', () => {
    expect(dateProblem('2026-10-26', now)).toMatch(/in the future/);
    expect(dateProblem('2099-10-24', now)).toMatch(/in the future/);
  });

  it('flags dates older than 400 days and keeps the limit itself', () => {
    expect(dateProblem('2025-09-20', now)).toBeNull(); // exactly 400 days
    expect(dateProblem('2025-09-19', now)).toMatch(/401 days ago/);
  });
});

describe('check-sources-fresh page scan', () => {
  const now = Date.UTC(2026, 9, 25, 12);
  const imp =
    "import SourcesSection from '../../components/calculators/shared/SourcesSection.astro';\n";
  const block = (checked: string) =>
    `<SourcesSection\n  sources={sources}\n  checked="${checked}"\n/>`;

  it('counts readable blocks and reports their date problems', () => {
    expect(checkPage(imp + block('2026-10-01'), now)).toEqual({ blocks: 1, problems: [] });
    expect(checkPage(imp + block('2026-99-99'), now).problems).toEqual([
      'sources checked 2026-99-99, not a real calendar date',
    ]);
    expect(checkPage(`${imp}<SourcesSection sources={s} />`, now).problems).toEqual([
      'SourcesSection has no checked="YYYY-MM-DD" date',
    ]);
  });

  it('fails a page that imports SourcesSection but has no block the gate can read', () => {
    const renamed = imp + '<Sources checked="2026-10-01" />';
    expect(checkPage(renamed, now).problems).toEqual([
      'imports SourcesSection but has no <SourcesSection ... /> block this gate can read',
    ]);
    // Not self-closing: the block regex needs "/>", so the check would otherwise read zero.
    expect(
      checkPage(`${imp}<SourcesSection checked="2026-10-01"></SourcesSection>`, now).blocks
    ).toBe(0);
    expect(
      checkPage(`${imp}<SourcesSection checked="2026-10-01"></SourcesSection>`, now).problems
    ).toHaveLength(1);
  });

  it('fails once validUntil has passed, names the page, and treats the last day as valid', () => {
    const withUntil = (until: string) =>
      `${imp}<SourcesSection checked="2026-10-01" validUntil="${until}" />`;
    expect(checkPage(withUntil('2026-10-25'), now).problems).toEqual([]);
    expect(checkPage(withUntil('2027-01-31'), now).problems).toEqual([]);
    const expired = scanSources(
      [{ rel: 'src/pages/tariff.astro', src: withUntil('2026-10-24') }],
      now
    );
    expect(expired.problems).toEqual([
      'src/pages/tariff.astro: figures were valid until 2026-10-24; refresh the figures and dates, then update checked and validUntil',
    ]);
  });

  it('validates validUntil like checked and rejects spellings it cannot read', () => {
    const attrs = (v: string) => `${imp}<SourcesSection checked="2026-10-01" validUntil${v} />`;
    expect(checkPage(attrs('="2026-99-99"'), now).problems).toEqual([
      'validUntil 2026-99-99, not a real calendar date',
    ]);
    expect(checkPage(attrs('={until}'), now).problems).toEqual([
      'validUntil must be written validUntil="YYYY-MM-DD"',
    ]);
    expect(checkPage(attrs('="soon"'), now).problems).toHaveLength(1);
  });

  it('ignores a page that never uses SourcesSection', () => {
    expect(checkPage('<h1>Hi</h1>', now)).toEqual({ blocks: 0, problems: [] });
  });

  it('fails when no page has a block at all, and prefixes problems with the page', () => {
    expect(scanSources([], now).problems).toEqual([
      'src/pages: no SourcesSection blocks found (component renamed or markup changed?)',
    ]);
    expect(scanSources([{ rel: 'src/pages/a.astro', src: '<h1>Hi</h1>' }], now).checkedPages).toBe(
      0
    );
    const scan = scanSources(
      [
        { rel: 'src/pages/a.astro', src: imp + block('2026-10-01') },
        { rel: 'src/pages/b.astro', src: imp + block('2099-10-24') },
      ],
      now
    );
    expect(scan.checkedPages).toBe(2);
    expect(scan.problems).toEqual([
      'src/pages/b.astro: sources checked 2099-10-24, which is in the future',
    ]);
  });
});

describe('check-noindex auditPages', () => {
  const A = 'https://boring-math.com/calculators/a/';
  const B = 'https://boring-math.com/calculators/b/';
  const page = (url: string, robots: string, hreflang: string[] = []) => ({
    url,
    html:
      `<meta name="robots" content="${robots}">` +
      hreflang.map((h) => `<link rel="alternate" hreflang="en" href="${h}">`).join(''),
  });

  it('passes consistent pages and counts the noindexed ones', () => {
    const pages = [page(A, 'index, follow', [A]), page(B, 'noindex, follow')];
    expect(auditPages(pages, new Set([A]))).toEqual({ errors: [], noindexed: 1 });
  });

  it('fails when no page carries a single hreflang link', () => {
    const { errors } = auditPages([page(A, 'index, follow')], new Set([A]));
    expect(errors).toEqual([expect.stringMatching(/no hreflang links found/)]);
    expect(auditPages([], new Set()).errors).toHaveLength(1);
  });

  it('reports sitemap mismatches and hreflang to unlisted pages', () => {
    const pages = [page(A, 'noindex', [B]), page(B, 'index')];
    expect(auditPages(pages, new Set([A])).errors).toEqual([
      `${A} is noindex but listed in the sitemap`,
      `${A} has hreflang to ${B}, which is not in the sitemap`,
      `${B} is indexable but missing from the sitemap`,
    ]);
  });
});

describe('check-noindex parseRegistry', () => {
  const entry = (href: string, extra = '') =>
    `  {\n    title: 'T',\n    description:\n      'A long description.',\n    href: '${href}',\n    mostUsed: false,\n${extra}  },\n`;
  const file = (body: string) =>
    `export const calculators: readonly CalculatorEntry[] = [\n${body}];\n\nexport function x() {}\n`;

  it('reads href and the noindex flag per entry', () => {
    const src = file(
      entry('/calculators/a/') +
        entry('/calculators/b/', '    noindex: true,\n') +
        entry('/calculators/c/')
    );
    expect(parseRegistry(src)).toEqual([
      { href: '/calculators/a/', noindex: false },
      { href: '/calculators/b/', noindex: true },
      { href: '/calculators/c/', noindex: false },
    ]);
  });

  it('fails loudly on a format it cannot read', () => {
    expect(() => parseRegistry('export const nothing = [];')).toThrow(/not found/);
    expect(() => parseRegistry(file('  // none\n'))).toThrow(/zero registry entries/);
    expect(() => parseRegistry(file(entry('/calculators/a/')))).toThrow(/zero noindex/);
    // A flag spelled any other way would silently read as unflagged.
    const odd = file(
      entry('/calculators/a/', '    noindex: true,\n') +
        entry('/calculators/b/', '    noindex: false,\n')
    );
    expect(() => parseRegistry(odd)).toThrow(/noindex lines/);
  });

  it('matches the real registry entry for entry', () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '..', '..', 'src', 'lib', 'calculators.ts'),
      'utf8'
    );
    expect(parseRegistry(src)).toEqual(
      calculators.map((c) => ({ href: c.href, noindex: c.noindex === true }))
    );
  });
});

describe('gsc-daily-core fillDailySeries', () => {
  const day = (n: number) => `2026-10-${String(n).padStart(2, '0')}`;
  const steady = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => ({
      keys: [day(from + i)],
      clicks: 5,
      impressions: 100,
      ctr: 0.05,
      position: 8,
    }));

  it('reports a cliff when steady traffic is followed by missing trailing days', () => {
    const series = fillDailySeries(steady(1, 14), day(22));
    expect(series).toHaveLength(22);
    expect(series.filter((d) => d.filled).map((d) => d.date)).toEqual(
      Array.from({ length: 8 }, (_, i) => day(15 + i))
    );
    expect(series.at(-1)).toMatchObject({ date: day(22), clicks: 0, impressions: 0, filled: true });
    expect(findCliff(series)).toEqual({ date: day(15), impressions: 0, median: 100 });
  });

  it('would have missed that cliff without the fill', () => {
    expect(findCliff(fillDailySeries(steady(1, 14), day(14)))).toBeNull();
  });

  it('fills a gap inside the series with zeros and keeps real rows untouched', () => {
    const rows = [...steady(1, 3), ...steady(6, 7)];
    const series = fillDailySeries(rows, day(7));
    expect(series.map((d) => d.impressions)).toEqual([100, 100, 100, 0, 0, 100, 100]);
    expect(series.filter((d) => d.filled).map((d) => d.date)).toEqual([day(4), day(5)]);
  });

  it('never drops a row dated after lastDate, and returns nothing for no rows', () => {
    expect(fillDailySeries(steady(1, 5), day(2))).toHaveLength(5);
    expect(fillDailySeries([], day(2))).toEqual([]);
  });
});
