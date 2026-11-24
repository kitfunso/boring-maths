import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const PAGES_DIR = path.resolve(__dirname, '..', '..', 'src', 'pages');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.astro')) out.push(full);
  }
  return out;
}

describe('page titles carry no stale years', () => {
  const currentYear = new Date().getFullYear();
  const offenders: string[] = [];

  for (const file of walk(PAGES_DIR)) {
    const source = fs.readFileSync(file, 'utf8');
    const match = source.match(/const title =\s*'([^']+)'/);
    if (!match) continue;
    const title = match[1];
    const years = (title.match(/\b20\d{2}\b/g) ?? []).map(Number);
    if (years.length > 0 && years.every((y) => y < currentYear)) {
      offenders.push(`${path.relative(PAGES_DIR, file)}: "${title}"`);
    }
  }

  it(`no title contains a year before ${currentYear}`, () => {
    expect(offenders, offenders.join('\n')).toEqual([]);
  });
});
