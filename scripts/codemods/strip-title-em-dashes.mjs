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

// Sweep em dashes out of `const title` (colon-or-dash) and `const description`
// (dash only) in every Astro page. The matchers and transforms live in the
// shared module so this codemod and tests/seo/no-em-dashes.test.ts stay aligned.
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

// Run only when executed directly (`node scripts/codemods/strip-title-em-dashes.mjs`),
// never as a side effect of importing this file.
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const changed = stripEmDashes();
  console.log(`${changed} files changed`);
}
