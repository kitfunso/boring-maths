#!/usr/bin/env node
// One-time codemod: ALL internal extensionless links -> trailing-slash form
// (R1: /about, /terms etc. from BaseLayout are in scope, not just
// /calculators|/guides). Touches href="..." attributes and href: '...'
// object fields only; skips /embed routes. Never matches canonicalURL
// consts (different syntax).
import fs from 'node:fs';
import { walkFiles } from '../lib/walk-files.mjs';

const FILE_RE = /\.(astro|ts|tsx)$/;
// Captures an optional #fragment or ?query suffix separately so the slash
// lands on the path portion only (href="/foo#faq" -> href="/foo/#faq").
// check-internal-links.mjs strips the fragment/query before checking, so
// keeping this in sync keeps the codemod and the postbuild checker agreeing.
const RULES = [
  [
    /href="(\/(?!embed\b)[a-z0-9-]+(?:\/[a-z0-9-]+)*)((?:[#?][^"]*)?)"/g,
    'href="$1/$2"',
  ],
  [
    /href: '(\/(?!embed\b)[a-z0-9-]+(?:\/[a-z0-9-]+)*)((?:[#?][^']*)?)'/g,
    "href: '$1/$2'",
  ],
];

let filesChanged = 0;
function rewrite(file) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [re, sub] of RULES) after = after.replace(re, sub);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    filesChanged += 1;
    console.log(`rewrote ${file}`);
  }
}
for (const file of walkFiles('src', FILE_RE)) rewrite(file);
console.log(`${filesChanged} files changed`);
