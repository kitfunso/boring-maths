#!/usr/bin/env node
// Fails the build if a calculator, category hub or guide page ships without
// BreadcrumbList JSON-LD (a dropped named slot once removed it from every hub).
import fs from 'node:fs';
import path from 'node:path';
import { walkFiles } from '../lib/walk-files.mjs';

const DIST = path.resolve('dist');
if (!fs.existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const pages = ['calculators', 'guides'].flatMap((dir) =>
  walkFiles(path.join(DIST, dir), /^index\.html$/),
);
const missing = pages.filter(
  (file) => !fs.readFileSync(file, 'utf8').includes('"@type":"BreadcrumbList"'),
);
if (missing.length > 0) {
  console.error(`FAIL: ${missing.length} pages have no BreadcrumbList schema`);
  for (const file of missing) console.error(`  ${path.relative(DIST, file)}`);
  process.exit(1);
}
console.log(`OK: BreadcrumbList schema on all ${pages.length} calculator, hub and guide pages.`);
