export const EM = '—';
export const TITLE_RE = /const title\s*=\s*(['"`])((?:\\.|(?!\1).)*)\1/gs;
export const DESCRIPTION_RE = /const description\s*=\s*(['"`])((?:\\.|(?!\1).)*)\1/gs;

export function transformTitleBody(body) {
  if (!body.includes(EM)) return body;
  return !body.slice(0, body.indexOf(EM)).includes(':')
    ? body.replace(/\s*—\s*/g, ': ')
    : body.replace(/\s*—\s*/g, ' - ');
}

export function transformDescriptionBody(body) {
  if (!body.includes(EM)) return body;
  return body.replace(/\s*—\s*/g, ' - ');
}

export function rewriteConsts(src, re, transformBody) {
  return src.replace(re, (full, quote, body) => {
    const next = transformBody(body);
    if (next === body) return full;
    const prefix = full.slice(0, full.length - quote.length * 2 - body.length);
    return `${prefix}${quote}${next}${quote}`;
  });
}
