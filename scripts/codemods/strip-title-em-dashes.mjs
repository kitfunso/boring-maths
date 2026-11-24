#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkFiles } from '../lib/walk-files.mjs';
import {
  TITLE_RE,
  DESCRIPTION_RE,
  transformTitleBody,
  transformDescriptionBody,
  rewriteConsts,
} from '../lib/title-em-dash.mjs';

export function stripEmDashes(dir = 'src/pages') {
  let changed = 0;
  for (const file of walkFiles(dir, /\.astro$/)) {
    const src = fs.readFileSync(file, 'utf8');
    let next = rewriteConsts(src, TITLE_RE, transformTitleBody);
    next = rewriteConsts(next, DESCRIPTION_RE, transformDescriptionBody);
    if (next !== src) {
      fs.writeFileSync(file, next, 'utf8');
      changed += 1;
    }
  }
  return changed;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const changed = stripEmDashes();
  console.log(`${changed} files changed`);
}
