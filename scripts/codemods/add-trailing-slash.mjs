#!/usr/bin/env node
import fs from 'node:fs';
import { walkFiles } from '../lib/walk-files.mjs';

const FILE_RE = /\.(astro|ts|tsx)$/;
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
