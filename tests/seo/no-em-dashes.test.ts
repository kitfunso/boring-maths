import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { walkFiles } from '../../scripts/lib/walk-files.mjs';
import { EM, TITLE_RE, DESCRIPTION_RE } from '../../scripts/lib/title-em-dash.mjs';

describe('Page titles and descriptions contain no em dashes (house style)', () => {
  it('page title consts are em-dash free', () => {
    const offenders: string[] = [];
    for (const file of walkFiles('src/pages', /\.astro$/)) {
      const src = readFileSync(file, 'utf8');
      const matches = [...src.matchAll(TITLE_RE)];
      if (matches.some((m) => m[2].includes(EM))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it('page description consts are em-dash free', () => {
    const offenders: string[] = [];
    for (const file of walkFiles('src/pages', /\.astro$/)) {
      const src = readFileSync(file, 'utf8');
      const matches = [...src.matchAll(DESCRIPTION_RE)];
      if (matches.some((m) => m[2].includes(EM))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it('calculator registry is em-dash free', () => {
    expect(readFileSync('src/lib/calculators.ts', 'utf8').includes(EM)).toBe(false);
  });
});
