#!/usr/bin/env node
// Noindex guard: the robots meta and the sitemap read the registry's noindex flag through separate
// code paths, so a calculator page must be in the sitemap exactly when it is indexable, and hreflang may
// only point at sitemap pages (Search Console reports both mismatches as errors).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', '..', 'dist');
const SITE = 'https://boring-math.com';

if (!fs.existsSync(DIST)) {
  console.error('ERROR: dist/ not found. Run the build first.');
  process.exit(1);
}

const sitemapFiles = fs.readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f));
const inSitemap = new Set(
  sitemapFiles.flatMap((f) =>
    [...fs.readFileSync(path.join(DIST, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => m[1]
    )
  )
);

function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return pages(full);
    return entry.name === 'index.html' ? [full] : [];
  });
}

const errors = [];
let noindexed = 0;
let checked = 0;
for (const file of pages(path.join(DIST, 'calculators'))) {
  const rel = path.relative(DIST, path.dirname(file)).split(path.sep).join('/');
  const url = `${SITE}/${rel}/`;
  const html = fs.readFileSync(file, 'utf8');
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '';
  const isNoindex = robots.includes('noindex');
  checked++;
  if (isNoindex) noindexed++;
  if (isNoindex && inSitemap.has(url)) errors.push(`${url} is noindex but listed in the sitemap`);
  if (!isNoindex && !inSitemap.has(url))
    errors.push(`${url} is indexable but missing from the sitemap`);
  for (const m of html.matchAll(/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g)) {
    if (!inSitemap.has(m[1]))
      errors.push(`${url} has hreflang to ${m[1]}, which is not in the sitemap`);
  }
}

if (errors.length > 0) {
  console.error(`ERROR: ${errors.length} noindex, sitemap or hreflang mismatches:`);
  for (const line of errors) console.error(`  ${line}`);
  process.exit(1);
}
console.log(
  `OK: ${checked} calculator pages, ${noindexed} noindex and out of the sitemap, the rest indexable and listed; hreflang targets all listed.`
);
