#!/usr/bin/env node
// Rate freshness guard: tax tables went stale for a year unnoticed (paycheck was on 2024 brackets in
// Oct 2026), so every page that cites official sources fails the build once its check is over 400 days old.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES = path.join(__dirname, '..', '..', 'src', 'pages');
const MAX_AGE_DAYS = 400;
const DAY_MS = 86_400_000;

function astroFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return astroFiles(full);
    return entry.name.endsWith('.astro') ? [full] : [];
  });
}

const now = Date.now();
const problems = [];
let checkedPages = 0;

for (const file of astroFiles(PAGES)) {
  const src = fs.readFileSync(file, 'utf8');
  const blocks = [...src.matchAll(/<SourcesSection\b([\s\S]*?)\/>/g)];
  const rel = path.relative(path.join(__dirname, '..', '..'), file).replaceAll('\\', '/');
  for (const [, attrs] of blocks) {
    checkedPages += 1;
    const date = attrs.match(/checked="(\d{4}-\d{2}-\d{2})"/)?.[1];
    if (!date) {
      problems.push(`${rel}: SourcesSection has no checked="YYYY-MM-DD" date`);
      continue;
    }
    const ageDays = Math.floor((now - Date.parse(`${date}T00:00:00Z`)) / DAY_MS);
    if (ageDays > MAX_AGE_DAYS) {
      problems.push(`${rel}: sources checked ${date}, ${ageDays} days ago`);
    }
  }
}

if (problems.length) {
  console.error(`FAIL: ${problems.length} page(s) with stale or undated sources (limit ${MAX_AGE_DAYS} days):`);
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    'Fix: re-check the rates on each page against its listed sources, update the code and tests, then set checked to today.'
  );
  process.exit(1);
}

console.log(`OK: ${checkedPages} pages cite sources checked within ${MAX_AGE_DAYS} days.`);
