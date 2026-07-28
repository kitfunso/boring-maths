import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Stale-year guard: no page <title> may contain a year older than the current
 * year. Year-in-title wins SERPs only while the year is current; a stale year
 * is worse than none (found live: nursery-cost shipped "2025" into July 2026,
 * GSC review 2026-07-28). This test starts failing every January by design -
 * that is the refresh reminder.
 *
 * Tax-year spans like "2026/27" pass on the leading year.
 */

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
    // Multi-year and span titles ("2022, ..., 2026", "2025/2026") stay valid
    // while at least one listed year is current; only all-stale titles fail.
    if (years.length > 0 && years.every((y) => y < currentYear)) {
      offenders.push(`${path.relative(PAGES_DIR, file)}: "${title}"`);
    }
  }

  it(`no title contains a year before ${currentYear}`, () => {
    expect(offenders, offenders.join('\n')).toEqual([]);
  });
});
