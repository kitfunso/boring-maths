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

const CLUSTER_MODIFIERS = new Set([
  'calculator',
  'calculators',
  'calculate',
  'calculation',
  'tool',
  'tools',
  'online',
  'free',
  'best',
  'top',
  'uk',
  'us',
  'usa',
  'eu',
  'united',
  'kingdom',
  'america',
  'vs',
  'versus',
  'compare',
  'comparison',
  'rate',
  'rates',
  'cost',
  'costs',
]);

const DIFFICULT_HEAD_TERMS = [
  'tax',
  'salary',
  'mortgage',
  'loan',
  'interest',
  'pension',
  'calculator',
  'budget',
  'roi',
];

const CLUSTER_HEAD_TERMS = ['tax', 'salary', 'mortgage', 'loan', 'pension', 'student', 'stamp', 'roi'];

const INTENT_TERMS = [
  'calculator',
  'calculate',
  'cost',
  'price',
  'tax',
  'salary',
  'mortgage',
  'loan',
  'pension',
  'budget',
  'payment',
  'take home',
  'take-home',
  'break even',
  'breakeven',
  'return on investment',
  'roi',
];

const RESEARCH_TERMS = ['what is', 'definition', 'guide', 'example', 'meaning'];

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function normaliseKeyword(keyword) {
  return String(keyword ?? '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenise(keyword) {
  const normalised = normaliseKeyword(keyword);
  if (!normalised) return [];
  return normalised.split(' ');
}

function singularise(token) {
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith('s') && !token.endsWith('ss') && token.length > 3) return token.slice(0, -1);
  return token;
}

export function extractKeyword(row) {
  return (
    row.keyword ??
    row.query ??
    row.term ??
    row.Keyword ??
    row.Query ??
    row.Term ??
    ''
  );
}

export function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function extractVolume(row) {
  const raw =
    row.volume ??
    row.searchVolume ??
    row.search_volume ??
    row.impressions ??
    row.Volume ??
    null;

  const parsed = parseNumber(raw);
  return parsed ?? 0;
}

export function difficultyScore(row) {
  const explicitRaw =
    row.keywordDifficulty ?? row.keyword_difficulty ?? row.difficulty ?? row.KeywordDifficulty ?? null;
  const explicit = parseNumber(explicitRaw);
  if (explicit !== null) return clamp(Math.round(explicit));

  const keyword = normaliseKeyword(extractKeyword(row));
  const words = tokenise(keyword).length;

  let score = 55;

  if (words >= 5) score -= 18;
  else if (words === 4) score -= 12;
  else if (words === 3) score -= 6;
  else if (words <= 2) score += 12;

  if (DIFFICULT_HEAD_TERMS.some((term) => keyword.includes(term))) score += 10;
  if (/\buk\b|\bus\b|\beu\b/.test(keyword)) score -= 4;
  if (/\b\d{4}\b/.test(keyword)) score -= 3;

  return clamp(Math.round(score));
}

export function businessIntentScore(keyword) {
  const normalised = normaliseKeyword(keyword);
  let score = 20;

  if (/\b(calculator|calculate|estimator|tool)\b/.test(normalised)) score += 35;
  if (INTENT_TERMS.some((term) => normalised.includes(term))) score += 30;
  if (/\b(vs|versus|compare|comparison)\b/.test(normalised)) score += 10;
  if (RESEARCH_TERMS.some((term) => normalised.includes(term))) score -= 12;

  return clamp(Math.round(score));
}

export function clusterLabel(keyword) {
  const tokens = tokenise(keyword).map(singularise);
  const core = tokens.filter(
    (token) =>
      token && !STOPWORDS.has(token) && !CLUSTER_MODIFIERS.has(token) && !/^\d+$/.test(token),
  );

  const headTerm = CLUSTER_HEAD_TERMS.find((term) => core.includes(term));
  if (headTerm) return headTerm;

  if (core.length > 0) return core.slice(0, 2).join(' ');

  const fallback = tokens.filter((token) => token && !STOPWORDS.has(token));
  if (fallback.length > 0) return fallback.slice(0, 2).join(' ');

  return 'misc';
}

function toClusterId(label) {
  const slug = label.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `cluster-${slug || 'misc'}`;
}

export function priorityScore({ intentScore, difficulty, volume }) {
  const volumeScore = clamp(Math.log10((volume ?? 0) + 1) * 30);
  const score = intentScore * 0.5 + (100 - difficulty) * 0.35 + volumeScore * 0.15;
  return Number(score.toFixed(2));
}

export function enrichKeywords(rows) {
  const enriched = rows
    .map((row) => {
      const keyword = extractKeyword(row);
      if (!normaliseKeyword(keyword)) return null;

      const label = clusterLabel(keyword);
      const clusterId = toClusterId(label);
      const intent = businessIntentScore(keyword);
      const difficulty = difficultyScore(row);
      const volume = extractVolume(row);
      const priority = priorityScore({ intentScore: intent, difficulty, volume });

      return {
        ...row,
        keyword,
        cluster_id: clusterId,
        cluster_label: label,
        business_intent_score: intent,
        keyword_difficulty_score: difficulty,
        priority_score: priority,
        search_volume: volume,
      };
    })
    .filter(Boolean);

  const sizeByCluster = enriched.reduce((acc, row) => {
    acc[row.cluster_id] = (acc[row.cluster_id] ?? 0) + 1;
    return acc;
  }, {});

  return enriched.map((row) => ({
    ...row,
    cluster_size: sizeByCluster[row.cluster_id] ?? 1,
  }));
}

export function summariseClusters(enrichedRows) {
  const groups = new Map();

  for (const row of enrichedRows) {
    const current = groups.get(row.cluster_id) ?? {
      cluster_id: row.cluster_id,
      cluster_label: row.cluster_label,
      keyword_count: 0,
      total_search_volume: 0,
      avg_business_intent_score: 0,
      avg_keyword_difficulty_score: 0,
      avg_priority_score: 0,
    };

    current.keyword_count += 1;
    current.total_search_volume += row.search_volume ?? 0;
    current.avg_business_intent_score += row.business_intent_score;
    current.avg_keyword_difficulty_score += row.keyword_difficulty_score;
    current.avg_priority_score += row.priority_score;

    groups.set(row.cluster_id, current);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      avg_business_intent_score: Number((group.avg_business_intent_score / group.keyword_count).toFixed(2)),
      avg_keyword_difficulty_score: Number((group.avg_keyword_difficulty_score / group.keyword_count).toFixed(2)),
      avg_priority_score: Number((group.avg_priority_score / group.keyword_count).toFixed(2)),
    }))
    .sort((a, b) => b.avg_priority_score - a.avg_priority_score);
}
