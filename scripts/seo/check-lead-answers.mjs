#!/usr/bin/env node
/**
 * Lead answer guard - every registry calculator needs a citable opening passage.
 *
 * HeroSection derives it from the page's own first FAQ answer, so a page whose
 * first FAQ happens to be a disclaimer ("Is this an official BA tool? No.")
 * silently leads on boilerplate instead of an answer. That is what `quickAnswer`
 * is for; this check makes the case fail the build rather than ship quietly.
 *
 * Runs postbuild against dist/. `--report` lists every lead without failing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(REPO_ROOT, 'dist');
const REGISTRY = path.join(REPO_ROOT, 'src', 'lib', 'calculators.ts');

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

const LEAD = /border-l-2[^>]*>\s*([\s\S]*?)\s*<\/p>/;
// a lead that answers a question about the tool instead of about the subject
const META =
  /^(is|are|does|do|can|will|should)\b[^?]*\b(this|these|our|the)\b[^?]*\b(tool|calculator|site|website|finder|app|guide|page)\b[^?]*\?/i;

const missing = [];
const boilerplate = [];
const leads = [];

for (const href of hrefs) {
  const file = path.join(DIST, href.slice(1), 'index.html');
  if (!fs.existsSync(file)) continue;
  const match = LEAD.exec(fs.readFileSync(file, 'utf8'));
  if (!match) {
    missing.push(href);
    continue;
  }
  const text = match[1]
    .replace(/<[^>]+>/g, '')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .trim();
  leads.push([href, text]);
  if (META.test(text)) boilerplate.push(`${href}: ${text.slice(0, 120)}`);
}

if (report) {
  for (const [href, text] of leads) console.log(`${href}\n  ${text.slice(0, 160)}\n`);
  console.log(
    `${leads.length} leads, ${missing.length} missing, ${boilerplate.length} boilerplate`
  );
  process.exit(0);
}

if (missing.length || boilerplate.length) {
  if (missing.length) {
    console.error(`FAIL: ${missing.length} calculator pages have no lead answer`);
    for (const href of missing.slice(0, 20)) console.error(`  ${href}`);
  }
  if (boilerplate.length) {
    console.error(`FAIL: ${boilerplate.length} lead answers open on a question about the tool.`);
    console.error('Set quickAnswer on these pages so the lead answers the subject instead.');
    for (const line of boilerplate) console.error(`  ${line}`);
  }
  process.exit(1);
}
console.log(`OK: all ${leads.length} calculator pages lead with a subject answer.`);
