#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const edges = JSON.parse(fs.readFileSync('scripts/seo/expected-link-edges.json', 'utf8'));
const missing = [];
for (const { from, to } of edges) {
  const page = path.join('dist', from, 'index.html');
  if (!fs.existsSync(page) || !fs.readFileSync(page, 'utf8').includes(`href="${to}"`)) {
    missing.push(`${from} -> ${to}`);
  }
}
if (missing.length) {
  console.error(`FAIL: ${missing.length} expected link edges missing from dist:`);
  for (const m of missing) console.error(`  ${m}`);
  process.exit(1);
}
console.log(`OK: all ${edges.length} expected link edges present.`);
