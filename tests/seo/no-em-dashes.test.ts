import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const EM = '—';

function collectAstroFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) collectAstroFiles(p, out);
    else if (entry.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

describe('SERP-visible strings contain no em dashes (house style)', () => {
  it('page title consts are em-dash free', () => {
    const offenders: string[] = [];
    for (const file of collectAstroFiles('src/pages')) {
      const src = readFileSync(file, 'utf8');
      const decls = src.match(/const title\s*=[^;]*;/gs) ?? [];
      if (decls.some((d) => d.includes(EM))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it('calculator registry is em-dash free', () => {
    expect(readFileSync('src/lib/calculators.ts', 'utf8').includes(EM)).toBe(false);
  });
});
