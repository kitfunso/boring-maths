// Shared by the codemod (scripts/codemods/strip-title-em-dashes.mjs) and the
// guard test (tests/seo/no-em-dashes.test.ts) so the em-dash detection regex
// and rewrite logic never drift apart. Pure exports, no side effects.

export const EM = '—'; // em dash: —

// Captures the quoted body directly (not up to the first semicolon) so a mid-string em dash like in 'A; B — C' isn't missed; the `s` flag lets descriptions span multiple lines.
export const TITLE_RE = /const title\s*=\s*(['"`])((?:\\.|(?!\1).)*)\1/gs;
export const DESCRIPTION_RE = /const description\s*=\s*(['"`])((?:\\.|(?!\1).)*)\1/gs;

// Titles: the first em dash becomes a colon if no colon precedes it yet (reads as "Name: subtitle"); otherwise every em dash becomes " - ".
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

/** Applies transformBody to every quoted const matched by re in src; returns the same reference if nothing changed, so callers can compare `next !== src`. */
export function rewriteConsts(src, re, transformBody) {
  return src.replace(re, (full, quote, body) => {
    const next = transformBody(body);
    if (next === body) return full;
    const prefix = full.slice(0, full.length - quote.length * 2 - body.length);
    return `${prefix}${quote}${next}${quote}`;
  });
}
