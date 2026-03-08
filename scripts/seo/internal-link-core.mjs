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
  'your',
  'you',
  'free',
  'online',
  'guide',
  'tool',
  'tools',
  'calculator',
  'calculators',
]);

function normalise(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function singularise(token) {
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith('s') && !token.endsWith('ss') && token.length > 3) return token.slice(0, -1);
  return token;
}

function tokenise(text) {
  return normalise(text)
    .split(' ')
    .map(singularise)
    .filter(Boolean)
    .filter((token) => !STOPWORDS.has(token))
    .filter((token) => token.length > 2 || token === 'uk' || token === 'us');
}

export function termsForPage(page) {
  const combined = [page.slug, page.title, page.keywords].filter(Boolean).join(' ');
  return [...new Set(tokenise(combined))];
}

export function similarityBetweenPages(source, target) {
  const sourceTerms = new Set(termsForPage(source));
  const targetTerms = new Set(termsForPage(target));

  if (sourceTerms.size === 0 || targetTerms.size === 0) {
    return { similarity: 0, sharedTerms: [] };
  }

  const sharedTerms = [...sourceTerms].filter((term) => targetTerms.has(term));
  const unionSize = new Set([...sourceTerms, ...targetTerms]).size;

  const similarity = unionSize === 0 ? 0 : sharedTerms.length / unionSize;

  return {
    similarity: Number(similarity.toFixed(3)),
    sharedTerms,
  };
}

export function buildInternalLinkMap(pages, options = {}) {
  const { maxLinksPerPage = 4, minSimilarity = 0.15 } = options;

  const rows = [];

  for (const source of pages) {
    const candidates = [];

    for (const target of pages) {
      if (source.url === target.url) continue;

      const { similarity, sharedTerms } = similarityBetweenPages(source, target);
      if (similarity < minSimilarity || sharedTerms.length === 0) continue;

      candidates.push({
        source_url: source.url,
        source_slug: source.slug,
        target_url: target.url,
        target_slug: target.slug,
        similarity_score: similarity,
        shared_terms: sharedTerms.slice(0, 6).join(' | '),
      });
    }

    candidates
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, maxLinksPerPage)
      .forEach((row) => rows.push(row));
  }

  return rows;
}

export function summariseInternalLinkMap(rows) {
  const grouped = new Map();

  for (const row of rows) {
    const current = grouped.get(row.source_url) ?? {
      source_url: row.source_url,
      source_slug: row.source_slug,
      suggested_links: 0,
      avg_similarity_score: 0,
      target_urls: [],
    };

    current.suggested_links += 1;
    current.avg_similarity_score += row.similarity_score;
    current.target_urls.push(row.target_url);

    grouped.set(row.source_url, current);
  }

  return [...grouped.values()]
    .map((row) => ({
      source_url: row.source_url,
      source_slug: row.source_slug,
      suggested_links: row.suggested_links,
      avg_similarity_score: Number((row.avg_similarity_score / row.suggested_links).toFixed(3)),
      target_urls: row.target_urls.join(' | '),
    }))
    .sort((a, b) => b.avg_similarity_score - a.avg_similarity_score);
}
