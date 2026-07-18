// Single source of truth for the em-dash house-style sweep over Astro page
// frontmatter. Both the codemod (scripts/codemods/strip-title-em-dashes.mjs)
// and the guard test (tests/seo/no-em-dashes.test.ts) import the matchers and
// transforms from here so the detection regex and the rewrite never drift apart.
//
// Importing this module has NO side effects (pure exports only).

export const EM = '—'; // em dash: —

// Captures the quoted string body directly (group 2) instead of stopping at the
// first semicolon, which would leave the em dash untouched in a value like
// 'A; B — C'. The `s` flag lets the body span newlines (descriptions are often
// wrapped across several lines in the frontmatter).
export const TITLE_RE = /const title\s*=\s*(['"`])((?:\\.|(?!\1).)*)\1/gs;
export const DESCRIPTION_RE = /const description\s*=\s*(['"`])((?:\\.|(?!\1).)*)\1/gs;

// Titles: the first em dash becomes a colon when the lead-in has no colon yet
// (an SEO title reads as "Name: subtitle"); if a colon already precedes the em
// dash, every em dash becomes " - " instead.
export function transformTitleBody(body) {
  if (!body.includes(EM)) return body;
  return !body.slice(0, body.indexOf(EM)).includes(':')
    ? body.replace(/\s*—\s*/g, ': ')
    : body.replace(/\s*—\s*/g, ' - ');
}

// Descriptions never get the colon treatment — an em dash is always " - ".
export function transformDescriptionBody(body) {
  if (!body.includes(EM)) return body;
  return body.replace(/\s*—\s*/g, ' - ');
}

/**
 * Apply `transformBody` to every quoted const matched by `re` in `src`.
 * Returns the rewritten source (identical reference-wise only if nothing
 * changed, so callers can compare `next !== src`).
 */
export function rewriteConsts(src, re, transformBody) {
  return src.replace(re, (full, quote, body) => {
    const next = transformBody(body);
    if (next === body) return full;
    const prefix = full.slice(0, full.length - quote.length * 2 - body.length);
    return `${prefix}${quote}${next}${quote}`;
  });
}
