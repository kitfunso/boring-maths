#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

// Captures the quoted string body directly (group 2) instead of stopping at
// the first semicolon, which would leave the em dash untouched in a title
// like 'A; B — C'.
const TITLE_RE = /const title\s*=\s*(['"`])((?:\\.|(?!\1).)*)\1/gs;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

let changed = 0;
for (const file of walk('src/pages')) {
  const src = fs.readFileSync(file, 'utf8');
  const next = src.replace(TITLE_RE, (full, quote, body) => {
    if (!body.includes('—')) return full;
    const prefix = full.slice(0, full.length - quote.length * 2 - body.length);
    const newBody = !body.slice(0, body.indexOf('—')).includes(':')
      ? body.replace(/\s*—\s*/g, ': ')
      : body.replace(/\s*—\s*/g, ' - ');
    return `${prefix}${quote}${newBody}${quote}`;
  });
  if (next !== src) {
    fs.writeFileSync(file, next, 'utf8');
    changed += 1;
  }
}
console.log(`${changed} files changed`);
