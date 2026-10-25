#!/usr/bin/env node
// Noindex guard: a calculator page must be in the sitemap exactly when it is indexable, hreflang may only
// point at sitemap pages, and both must match the registry flag, which is read from source because the
// built robots meta and sitemap share one code path and could agree on the wrong state.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { sitemapLocs } from './indexnow-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const DIST = path.join(ROOT, 'dist');
const REGISTRY = path.join(ROOT, 'src', 'lib', 'calculators.ts');
const SITE = 'https://boring-math.com';

// CI runs plain Node and cannot import the .ts registry, so this parses the text and throws on drift.
export function parseRegistry(src) {
  const body = src
    .replaceAll('\r\n', '\n')
    .match(/export const calculators\b[^=]*=\s*\[\n([\s\S]*?)\n\];/)?.[1];
  if (!body) throw new Error('registry array "export const calculators = [ ... ];" not found');
  const entries = [...body.matchAll(/^ {2}\{\n([\s\S]*?)\n {2}\},?$/gm)].map(([, fields]) => {
    const href = fields.match(/^ {4}href: '([^']+)',?$/m)?.[1];
    if (!href) throw new Error(`registry entry without a single-quoted href:\n${fields}`);
    return { href, noindex: /^ {4}noindex: true,?$/m.test(fields) };
  });
  if (entries.length === 0) throw new Error('parsed zero registry entries');
  const hrefLines = body.match(/^\s*href:/gm)?.length ?? 0;
  if (hrefLines !== entries.length) {
    throw new Error(`registry has ${hrefLines} href lines but ${entries.length} parsed entries`);
  }
  const noindexLines = body.match(/^\s*noindex:/gm)?.length ?? 0;
  const flagged = entries.filter((e) => e.noindex).length;
  if (flagged === 0) throw new Error('parsed zero noindex registry entries');
  if (noindexLines !== flagged) {
    throw new Error(
      `registry has ${noindexLines} noindex lines but only ${flagged} are "noindex: true"`
    );
  }
  return entries;
}

function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return pages(full);
    return entry.name === 'index.html' ? [full] : [];
  });
}

function robotsNoindex(html) {
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '';
  return robots.includes('noindex');
}

/** Built-page checks over { url, html }; zero hreflang links anywhere means the markup changed, not that all is well. */
export function auditPages(pageList, inSitemap) {
  const errors = [];
  let noindexed = 0;
  let hreflangLinks = 0;
  for (const { url, html } of pageList) {
    const isNoindex = robotsNoindex(html);
    if (isNoindex) noindexed++;
    if (isNoindex && inSitemap.has(url)) errors.push(`${url} is noindex but listed in the sitemap`);
    if (!isNoindex && !inSitemap.has(url))
      errors.push(`${url} is indexable but missing from the sitemap`);
    for (const m of html.matchAll(/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g)) {
      hreflangLinks++;
      if (!inSitemap.has(m[1]))
        errors.push(`${url} has hreflang to ${m[1]}, which is not in the sitemap`);
    }
  }
  if (hreflangLinks === 0) {
    errors.push(
      'no hreflang links found on any calculator page (attribute order or markup changed?)'
    );
  }
  return { errors, noindexed };
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('ERROR: dist/ not found. Run the build first.');
    process.exit(1);
  }

  let registry;
  try {
    registry = parseRegistry(fs.readFileSync(REGISTRY, 'utf8'));
  } catch (err) {
    console.error(
      `ERROR: cannot read the noindex flags from src/lib/calculators.ts: ${err.message}`
    );
    process.exit(1);
  }

  const sitemapFiles = fs.readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f));
  const inSitemap = new Set(
    sitemapFiles.flatMap((f) => sitemapLocs(fs.readFileSync(path.join(DIST, f), 'utf8')))
  );

  const built = pages(path.join(DIST, 'calculators')).map((file) => {
    const rel = path.relative(DIST, path.dirname(file)).split(path.sep).join('/');
    return { url: `${SITE}/${rel}/`, html: fs.readFileSync(file, 'utf8') };
  });
  const { errors, noindexed } = auditPages(built, inSitemap);
  const checked = built.length;

  for (const { href, noindex } of registry) {
    const url = `${SITE}${href}`;
    const file = path.join(DIST, href, 'index.html');
    if (!fs.existsSync(file)) {
      errors.push(`${url} is in the registry but has no built page`);
      continue;
    }
    const isNoindex = robotsNoindex(fs.readFileSync(file, 'utf8'));
    const listed = inSitemap.has(url);
    if (noindex && !isNoindex)
      errors.push(`${url} is flagged noindex in the registry but renders indexable`);
    if (noindex && listed)
      errors.push(`${url} is flagged noindex in the registry but listed in the sitemap`);
    if (!noindex && isNoindex)
      errors.push(`${url} is unflagged in the registry but renders noindex`);
    if (!noindex && !listed)
      errors.push(`${url} is unflagged in the registry but missing from the sitemap`);
  }

  if (errors.length > 0) {
    console.error(`ERROR: ${errors.length} noindex, sitemap or hreflang mismatches:`);
    for (const line of errors) console.error(`  ${line}`);
    process.exit(1);
  }
  const flagged = registry.filter((e) => e.noindex).length;
  console.log(
    `OK: ${checked} calculator pages, ${noindexed} noindex and out of the sitemap, the rest indexable and listed; hreflang targets all listed; registry agrees (${flagged} of ${registry.length} entries flagged noindex).`
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
