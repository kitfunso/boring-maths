#!/usr/bin/env node
/**
 * Orphan guard - every registry calculator must have editorial inbound links.
 *
 * The registry grid (homepage, /calculators, category hubs) links every
 * calculator by construction, so those pages prove nothing. This check counts
 * inbound links from EDITORIAL pages only: other calculators' related-links
 * sections and guides. A calculator with zero editorial inbound links is an
 * orphan - Google has been observed refusing to crawl exactly those pages
 * (uk-redundancy-pay / uk-holiday-entitlement, "URL is unknown to Google",
 * GSC review 2026-07-28) even when they are in the sitemap.
 *
 * Runs postbuild against dist/. `--report` prints the full distribution
 * without failing (used to set the threshold from measurement).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(REPO_ROOT, 'dist');
const REGISTRY = path.join(REPO_ROOT, 'src', 'lib', 'calculators.ts');

const MIN_INBOUND = 1; // orphan = zero editorial inbound links

const report = process.argv.includes('--report');

if (!fs.existsSync(DIST)) {
  console.error('ERROR: dist/ not found. Run the build first.');
  process.exit(1);
}

const registrySource = fs.readFileSync(REGISTRY, 'utf8');
const hrefs = [...registrySource.matchAll(/href: '(\/calculators\/[^']+\/)'/g)].map((m) => m[1]);
if (hrefs.length === 0) {
  console.error('ERROR: no registry hrefs parsed from src/lib/calculators.ts');
  process.exit(1);
}

/** dist html file for a calculator href, if it exists. */
function distFileFor(href) {
  return path.join(DIST, ...href.split('/').filter(Boolean), 'index.html');
}

// Editorial referrer set: calculator pages themselves + guides.
const referrers = [];
for (const href of hrefs) {
  const file = distFileFor(href);
  if (fs.existsSync(file)) referrers.push({ href, file, html: fs.readFileSync(file, 'utf8') });
}
const guidesDir = path.join(DIST, 'guides');
if (fs.existsSync(guidesDir)) {
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'index.html') {
        referrers.push({ href: null, file: full, html: fs.readFileSync(full, 'utf8') });
      }
    }
  };
  walk(guidesDir);
}

const counts = new Map();
for (const href of hrefs) {
  const needle = `href="${href}"`;
  let count = 0;
  for (const ref of referrers) {
    if (ref.href === href) continue; // self-links do not count
    if (ref.html.includes(needle)) count += 1;
  }
  counts.set(href, count);
}

const sorted = [...counts.entries()].sort((a, b) => a[1] - b[1]);
const orphans = sorted.filter(([, c]) => c < MIN_INBOUND);

if (report) {
  console.log('Editorial inbound-link distribution (lowest first):');
  for (const [href, count] of sorted.slice(0, 30)) {
    console.log(`  ${String(count).padStart(3)}  ${href}`);
  }
  const buckets = {};
  for (const [, c] of sorted) buckets[c] = (buckets[c] || 0) + 1;
  console.log('Histogram (inbound -> pages):', JSON.stringify(buckets));
}

// Ratchet baseline: pre-existing orphans are tracked debt, new orphans fail.
const baselinePath = path.join(__dirname, 'known-orphans.json');
const baseline = new Set(
  fs.existsSync(baselinePath)
    ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')).knownOrphans
    : [],
);

const newOrphans = orphans.filter(([href]) => !baseline.has(href));
const resolvedBaseline = [...baseline].filter((href) => (counts.get(href) ?? 0) >= MIN_INBOUND);

let failed = false;
if (newOrphans.length > 0) {
  failed = true;
  console.error(
    `NEW ORPHAN PAGES: ${newOrphans.length} registry calculator(s) have zero editorial inbound links\n` +
      newOrphans.map(([href]) => `  ${href}`).join('\n') +
      `\nAdd a related-calculator link from at least one other calculator or guide page.`,
  );
}
if (resolvedBaseline.length > 0) {
  failed = true;
  console.error(
    `STALE BASELINE: these pages now have inbound links - remove them from known-orphans.json (ratchet down):\n` +
      resolvedBaseline.map((href) => `  ${href}`).join('\n'),
  );
}
if (!failed) {
  console.log(
    `OK: no new orphans (${hrefs.length} calculators checked, ${baseline.size} known orphans remain in the baseline).`,
  );
} else if (!report) {
  process.exit(1);
}
