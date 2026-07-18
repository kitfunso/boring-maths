import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const EM = '—';

// Captures the quoted string body directly (group 2) instead of stopping at
// the first semicolon, which would falsely pass a title like 'A; B — C'.
const TITLE_RE = /const title\s*=\s*(['"`])((?:\\.|(?!\1).)*)\1/gs;

function collectAstroFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) collectAstroFiles(p, out);
    else if (entry.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

describe('Page titles contain no em dashes (house style; descriptions deferred)', () => {
  it('page title consts are em-dash free', () => {
    const offenders: string[] = [];
    for (const file of collectAstroFiles('src/pages')) {
      const src = readFileSync(file, 'utf8');
      const matches = [...src.matchAll(TITLE_RE)];
      if (matches.some((m) => m[2].includes(EM))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it('calculator registry is em-dash free', () => {
    expect(readFileSync('src/lib/calculators.ts', 'utf8').includes(EM)).toBe(false);
  });
});
