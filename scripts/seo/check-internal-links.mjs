#!/usr/bin/env node
// Fails the build if any internal <a href> in dist/ emits the slash-less
// URL form (Cloudflare 308s it; canonical is trailingSlash:'always').
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const offenders = [];
if (!fs.existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.html')) checkFile(p);
  }
}

function checkFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?<![\w-])href="(\/[^"]*)"/g)) {
    const raw = match[1];
    if (raw.startsWith('//')) continue; // protocol-relative external
    const href = raw.replace(/[#?].*$/, ''); // strip fragment/query, THEN check the path
    if (href === '/' || href === '') continue;
    if (/\.[a-z0-9]+$/i.test(href)) continue; // asset files (.xml, .webp, .txt, ...)
    if (href === '/embed' || href.startsWith('/embed/')) continue;
    if (!href.endsWith('/')) offenders.push(`${path.relative(DIST, file)}: ${raw}`);
  }
}

walk(DIST);
if (offenders.length > 0) {
  console.error(`FAIL: ${offenders.length} internal hrefs missing trailing slash`);
  for (const o of offenders.slice(0, 40)) console.error(`  ${o}`);
  if (offenders.length > 40) console.error(`  ...and ${offenders.length - 40} more`);
  process.exit(1);
}
console.log('OK: all internal hrefs use the trailing-slash canonical form.');
