/** Flags CardPerksCalculator rows past the staleness window; parses cards.ts
 *  as text so CI never needs the Astro/TS toolchain. Usage: --days N. */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CARDS_FILE = join(
  __dirname,
  '..',
  '..',
  'src',
  'components',
  'calculators',
  'CardPerksCalculator',
  'data',
  'cards.ts'
);

const ID_RE = /id:\s*'([a-z0-9-]+)'/g;
const DATE_RE = /lastVerified:\s*'(\d{4}-\d{2}-\d{2})'/g;

/** Pairs each id with the lastVerified date that follows it in the source
 *  text (one per row); returns rows older than `days` relative to `today`. */
export function staleRows(source, today, days) {
  const ids = [...source.matchAll(ID_RE)].map((m) => ({ id: m[1], index: m.index }));
  const dates = [...source.matchAll(DATE_RE)].map((m) => ({ date: m[1], index: m.index }));
  const cutoff = new Date(today);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);

  const stale = [];
  ids.forEach((row, i) => {
    const nextIdIndex = ids[i + 1]?.index ?? Infinity;
    const match = dates.find((d) => d.index > row.index && d.index < nextIdIndex);
    if (match && new Date(match.date) < cutoff) {
      stale.push({ id: row.id, lastVerified: match.date });
    }
  });
  return stale;
}

function main() {
  const daysFlagIndex = process.argv.indexOf('--days');
  const days = daysFlagIndex === -1 ? 120 : Number(process.argv[daysFlagIndex + 1]);
  const source = readFileSync(CARDS_FILE, 'utf-8');
  const today = new Date().toISOString().slice(0, 10);
  const stale = staleRows(source, today, days);

  if (stale.length === 0) {
    console.log(`No card rows older than ${days} days.`);
    process.exit(0);
  }

  console.log(`${stale.length} card row(s) older than ${days} days:`);
  stale.forEach((row) => console.log(`  ${row.id}: last verified ${row.lastVerified}`));
  process.exit(1);
}

// Guards against running main() when vitest imports staleRows for a unit test.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
