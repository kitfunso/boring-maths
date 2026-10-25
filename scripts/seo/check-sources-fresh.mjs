#!/usr/bin/env node
// Rate freshness guard: tax tables went stale for a year unnoticed (paycheck was on 2024 brackets in
// Oct 2026), so every page that cites official sources fails the build once its check is over 400 days old
// or its optional validUntil (data with a known end date) has passed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES = path.join(__dirname, '..', '..', 'src', 'pages');
const MAX_AGE_DAYS = 400;
const DAY_MS = 86_400_000;

// The round-trip rejects 2026-99-99 (NaN) and 2026-02-30 (which Date would roll into March).
function isRealDate(date) {
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

const utcDay = (now) => new Date(now).toISOString().slice(0, 10);

/** Why a checked date fails the gate, or null when it is a real, past or present, fresh date. */
export function dateProblem(date, now = Date.now()) {
  if (!isRealDate(date)) return `sources checked ${date}, not a real calendar date`;
  if (date > utcDay(now)) return `sources checked ${date}, which is in the future`;
  const ageDays = Math.floor((now - Date.parse(`${date}T00:00:00Z`)) / DAY_MS);
  return ageDays > MAX_AGE_DAYS ? `sources checked ${date}, ${ageDays} days ago` : null;
}

/** Why a validUntil date fails the gate; the date itself is still valid, the day after is not. */
export function validUntilProblem(date, now = Date.now()) {
  if (!isRealDate(date)) return `validUntil ${date}, not a real calendar date`;
  return utcDay(now) > date
    ? `figures were valid until ${date}; refresh the figures and dates, then update checked and validUntil`
    : null;
}

function astroFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return astroFiles(full);
    return entry.name.endsWith('.astro') ? [full] : [];
  });
}

/** Block count and problems for one page, so a renamed component or changed markup cannot pass as zero. */
export function checkPage(src, now = Date.now()) {
  const blocks = [...src.matchAll(/<SourcesSection\b([\s\S]*?)\/>/g)];
  const problems = [];
  if (blocks.length === 0 && /\bimport\b[^;]*?\bSourcesSection\b[^;]*?\bfrom\b/.test(src)) {
    problems.push(
      'imports SourcesSection but has no <SourcesSection ... /> block this gate can read'
    );
  }
  for (const [, attrs] of blocks) {
    const date = attrs.match(/checked="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const problem = date
      ? dateProblem(date, now)
      : 'SourcesSection has no checked="YYYY-MM-DD" date';
    if (problem) problems.push(problem);
    // Any validUntil spelling must parse, or an expression form would silently skip the expiry check.
    if (/\bvalidUntil\s*=/.test(attrs)) {
      const until = attrs.match(/\bvalidUntil="(\d{4}-\d{2}-\d{2})"/)?.[1];
      const expired = until
        ? validUntilProblem(until, now)
        : 'validUntil must be written validUntil="YYYY-MM-DD"';
      if (expired) problems.push(expired);
    }
  }
  return { blocks: blocks.length, problems };
}

/** Checks every { rel, src } page; zero blocks overall is itself a problem. */
export function scanSources(pages, now = Date.now()) {
  const problems = [];
  let checkedPages = 0;
  for (const { rel, src } of pages) {
    const page = checkPage(src, now);
    checkedPages += page.blocks;
    for (const problem of page.problems) problems.push(`${rel}: ${problem}`);
  }
  if (checkedPages === 0) {
    problems.push(
      'src/pages: no SourcesSection blocks found (component renamed or markup changed?)'
    );
  }
  return { checkedPages, problems };
}

function main() {
  const pages = astroFiles(PAGES).map((file) => ({
    rel: path.relative(path.join(__dirname, '..', '..'), file).replaceAll('\\', '/'),
    src: fs.readFileSync(file, 'utf8'),
  }));
  const { checkedPages, problems } = scanSources(pages);

  if (problems.length) {
    console.error(
      `FAIL: ${problems.length} page(s) with stale, undated or invalid-dated sources (limit ${MAX_AGE_DAYS} days):`
    );
    for (const p of problems) console.error(`  ${p}`);
    console.error(
      'Fix: re-check the rates on each page against its listed sources, update the code and tests, then set checked to today.'
    );
    process.exit(1);
  }

  console.log(`OK: ${checkedPages} pages cite sources checked within ${MAX_AGE_DAYS} days.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
