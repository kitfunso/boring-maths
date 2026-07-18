#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

let changed = 0;
for (const file of walk('src/pages')) {
  const src = fs.readFileSync(file, 'utf8');
  const next = src.replace(/const title\s*=[^;]*;/gs, (decl) => {
    if (!decl.includes('—')) return decl;
    if (!decl.slice(0, decl.indexOf('—')).includes(':')) {
      return decl.replace(/\s*—\s*/g, ': ');
    }
    return decl.replace(/\s*—\s*/g, ' - ');
  });
  if (next !== src) {
    fs.writeFileSync(file, next, 'utf8');
    changed += 1;
  }
}
console.log(`${changed} files changed`);
