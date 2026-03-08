function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'the',
  'to',
  'for',
  'of',
  'in',
  'on',
  'with',
  'by',
  'at',
  'from',
  'is',
  'are',
  'be',
  'how',
  'what',
  'when',
  'why',
]);

const REGION_TERMS = new Set(['uk', 'us', 'usa', 'eu']);

export function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function toUrlPath(pageValue) {
  const raw = String(pageValue ?? '').trim();
  if (!raw) return '/';

  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return new URL(raw).pathname || '/';
    }
  } catch {
    // fall through to manual path handling
  }

  if (!raw.startsWith('/')) return `/${raw}`;
  return raw;
}

export function normaliseText(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenise(text) {
  return normaliseText(text)
    .split(' ')
    .filter(Boolean)
    .filter((token) => !STOPWORDS.has(token));
}

export function coverageForQuery(query, pageText) {
  const queryTerms = tokenise(query).filter((term) => term.length > 1 || REGION_TERMS.has(term));
  const pageTerms = new Set(tokenise(pageText));

  if (queryTerms.length === 0) {
    return {
      query_terms: [],
      matched_terms: [],
      missing_terms: [],
      coverage_ratio: 1,
    };
  }

  const matched = queryTerms.filter((term) => pageTerms.has(term));
  const missing = queryTerms.filter((term) => !pageTerms.has(term));

  return {
    query_terms: queryTerms,
    matched_terms: matched,
    missing_terms: missing,
    coverage_ratio: Number((matched.length / queryTerms.length).toFixed(3)),
  };
}

function positionBucketBoost(position) {
  if (position <= 3) return 5;
  if (position <= 10) return 20;
  if (position <= 20) return 15;
  if (position <= 40) return 8;
  return 0;
}

export function opportunityScore({ impressions, clicks, position, coverageRatio }) {
  const safeImpressions = Math.max(0, impressions ?? 0);
  const safeClicks = Math.max(0, clicks ?? 0);
  const ctr = safeImpressions > 0 ? safeClicks / safeImpressions : 0;

  const impressionComponent = clamp(Math.log10(safeImpressions + 1) * 20, 0, 40);
  const gapComponent = clamp((1 - coverageRatio) * 40, 0, 40);
  const positionComponent = positionBucketBoost(position);
  const ctrComponent = clamp((0.05 - ctr) * 200, 0, 10);

  return Number((impressionComponent + gapComponent + positionComponent + ctrComponent).toFixed(2));
}

export function buildRefreshOpportunities(rows, pageTextByUrlPath, options = {}) {
  const {
    minImpressions = 50,
    minPosition = 3,
    maxPosition = 40,
    maxCoverage = 0.8,
  } = options;

  const opportunities = [];

  for (const row of rows) {
    const pageUrlPath = toUrlPath(row.page_url ?? row.page ?? row.url ?? row.Page ?? row.URL ?? '/');
    const query = row.query ?? row.keyword ?? row.Query ?? row.Keyword ?? '';
    const impressions = parseNumber(row.impressions ?? row.Impressions ?? row.search_volume ?? 0) ?? 0;
    const clicks = parseNumber(row.clicks ?? row.Clicks ?? 0) ?? 0;
    const position = parseNumber(row.position ?? row.Position ?? 999) ?? 999;

    if (!query || impressions < minImpressions) continue;
    if (position < minPosition || position > maxPosition) continue;

    const pageText = pageTextByUrlPath[pageUrlPath] ?? '';
    const coverage = coverageForQuery(query, pageText);
    const missingTerms = coverage.missing_terms;

    if (coverage.coverage_ratio > maxCoverage || missingTerms.length === 0) continue;

    opportunities.push({
      ...row,
      page_url: pageUrlPath,
      query,
      impressions,
      clicks,
      position,
      coverage_ratio: coverage.coverage_ratio,
      missing_terms: missingTerms.join(' | '),
      opportunity_score: opportunityScore({
        impressions,
        clicks,
        position,
        coverageRatio: coverage.coverage_ratio,
      }),
    });
  }

  return opportunities.sort((a, b) => b.opportunity_score - a.opportunity_score);
}

export function summariseRefreshOpportunities(opportunities) {
  const grouped = new Map();

  for (const row of opportunities) {
    const current = grouped.get(row.page_url) ?? {
      page_url: row.page_url,
      opportunity_count: 0,
      total_impressions: 0,
      avg_position: 0,
      avg_coverage_ratio: 0,
      avg_opportunity_score: 0,
      missing_term_counts: {},
    };

    current.opportunity_count += 1;
    current.total_impressions += row.impressions;
    current.avg_position += row.position;
    current.avg_coverage_ratio += row.coverage_ratio;
    current.avg_opportunity_score += row.opportunity_score;

    String(row.missing_terms)
      .split('|')
      .map((term) => term.trim())
      .filter(Boolean)
      .forEach((term) => {
        current.missing_term_counts[term] = (current.missing_term_counts[term] ?? 0) + 1;
      });

    grouped.set(row.page_url, current);
  }

  return [...grouped.values()]
    .map((row) => {
      const topMissing = Object.entries(row.missing_term_counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([term]) => term)
        .join(' | ');

      return {
        page_url: row.page_url,
        opportunity_count: row.opportunity_count,
        total_impressions: row.total_impressions,
        avg_position: Number((row.avg_position / row.opportunity_count).toFixed(2)),
        avg_coverage_ratio: Number((row.avg_coverage_ratio / row.opportunity_count).toFixed(3)),
        avg_opportunity_score: Number((row.avg_opportunity_score / row.opportunity_count).toFixed(2)),
        top_missing_terms: topMissing,
      };
    })
    .sort((a, b) => b.avg_opportunity_score - a.avg_opportunity_score);
}
