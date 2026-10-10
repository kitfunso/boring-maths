#!/usr/bin/env node
// OG image guard: every built page's og:image must be a file in dist/. Link previews and AI answer
// cards fetch it, and a hand-kept generator list once left 110 of 181 calculators pointing at a 404.
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

function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return pages(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

const missing = [];
let checked = 0;
for (const file of pages(DIST)) {
  const match = fs.readFileSync(file, 'utf8').match(/<meta property="og:image" content="([^"]+)"/);
  if (!match) continue;
  checked++;
  const image = match[1].startsWith(SITE) ? match[1].slice(SITE.length) : match[1];
  if (!image.startsWith('/') || !fs.existsSync(path.join(DIST, image))) {
    missing.push(`${path.relative(DIST, file).split(path.sep).join('/')} -> ${match[1]}`);
  }
}

if (missing.length > 0) {
  console.error(
    `ERROR: ${missing.length} of ${checked} pages point og:image at a file not in dist/:`
  );
  for (const line of missing) console.error(`  ${line}`);
  process.exit(1);
}
console.log(`OK: og:image resolves to a built file on all ${checked} pages.`);
