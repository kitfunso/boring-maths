#!/usr/bin/env node
// One-time codemod: ALL internal extensionless links -> trailing-slash form
// (R1: /about, /terms etc. from BaseLayout are in scope, not just
// /calculators|/guides). Touches href="..." attributes and href: '...'
// object fields only; skips /embed routes. Never matches canonicalURL
// consts (different syntax).
import fs from 'node:fs';
import path from 'node:path';

const FILE_RE = /\.(astro|ts|tsx)$/;
const RULES = [
  [/href="(\/(?!embed\b)[a-z0-9-]+(?:\/[a-z0-9-]+)*)"/g, 'href="$1/"'],
  [/href: '(\/(?!embed\b)[a-z0-9-]+(?:\/[a-z0-9-]+)*)'/g, "href: '$1/'"],
];

let filesChanged = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (FILE_RE.test(entry.name)) rewrite(p);
  }
}
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
walk('src');
console.log(`${filesChanged} files changed`);
