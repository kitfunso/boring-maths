#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const edges = JSON.parse(fs.readFileSync('scripts/seo/expected-link-edges.json', 'utf8'));

// Group edges by `from` so each dist file is read at most once.
const byFrom = new Map();
for (const { from, to } of edges) {
  if (!byFrom.has(from)) byFrom.set(from, []);
  byFrom.get(from).push(to);
}

const missing = [];
for (const [from, targets] of byFrom) {
  const page = path.join('dist', from, 'index.html');
  const content = fs.existsSync(page) ? fs.readFileSync(page, 'utf8') : null;
  for (const to of targets) {
    if (content === null || !content.includes(`href="${to}"`)) {
      missing.push(`${from} -> ${to}`);
    }
  }
}
if (missing.length) {
  console.error(`FAIL: ${missing.length} expected link edges missing from dist:`);
  for (const m of missing) console.error(`  ${m}`);
  process.exit(1);
}
console.log(`OK: all ${edges.length} expected link edges present.`);
