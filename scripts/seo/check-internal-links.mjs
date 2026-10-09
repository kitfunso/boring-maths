#!/usr/bin/env node
// Fails the build if any internal <a href> in dist/ emits the slash-less
// URL form (Cloudflare 308s it; canonical is trailingSlash:'always') or
// points at a page the build did not produce (a live 404).
import fs from 'node:fs';
import path from 'node:path';
import { walkFiles } from '../lib/walk-files.mjs';

const DIST = path.resolve('dist');
const ORIGIN = 'https://boring-math.com';
const offenders = [];
const dead = new Map();
if (!fs.existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

function checkFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?<![\w-])href="((?:https:\/\/boring-math\.com)?\/[^"]*)"/g)) {
    const raw = match[1];
    if (raw.startsWith('//')) continue; // protocol-relative external
    const href = raw.replace(ORIGIN, '').replace(/[#?].*$/, ''); // absolute self-links count too
    if (href === '/' || href === '') continue;
    if (/\.[a-z0-9]+$/i.test(href)) continue; // asset files (.xml, .webp, .txt, ...)
    if (!href.endsWith('/')) offenders.push(`${path.relative(DIST, file)}: ${raw}`);
    else if (!fs.existsSync(path.join(DIST, href, 'index.html'))) {
      if (!dead.has(href)) dead.set(href, []);
      dead.get(href).push(path.relative(DIST, file));
    }
  }
}

// 404.html is served for every missing path, so its self-canonical never resolves.
for (const file of walkFiles(DIST, /\.html$/)) {
  if (path.relative(DIST, file) !== '404.html') checkFile(file);
}
if (offenders.length > 0) {
  console.error(`FAIL: ${offenders.length} internal hrefs missing trailing slash`);
  for (const o of offenders.slice(0, 40)) console.error(`  ${o}`);
  if (offenders.length > 40) console.error(`  ...and ${offenders.length - 40} more`);
}
if (dead.size > 0) {
  console.error(`FAIL: ${dead.size} internal link targets have no built page`);
  for (const [href, from] of dead) {
    console.error(`  ${href}  (linked from ${from.length} page(s), e.g. ${from[0]})`);
  }
}
if (offenders.length > 0 || dead.size > 0) process.exit(1);
console.log('OK: all internal hrefs use the trailing-slash form and resolve to a built page.');
