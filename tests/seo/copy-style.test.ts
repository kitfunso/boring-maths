import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { walkFiles } from '../../scripts/lib/walk-files.mjs';

// Only phrases with no domain meaning are listed; words like "journey" have real uses here.

const SRC = path.resolve(__dirname, '..', '..', 'src');
// Built from the code point so this file passes its own check.
const EM_DASH = String.fromCharCode(0x2014);
const EM_DASH_RE = new RegExp(`${EM_DASH}|&mdash;|&#8212;|&#x2014;|\\\\u2014`, 'i');
const TEXT = (name: string): boolean =>
  !/\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|eot|pdf)$/i.test(name);
const APOSTROPHE = "(?:'|\\u2019|&apos;|&#39;|&rsquo;)";
const STOCK_PHRASES: readonly RegExp[] = [
  // Case-sensitive: the sentence opener is the filler; a mid-sentence "whether you're X or Y" is a real choice.
  new RegExp(`Whether you${APOSTROPHE}re`),
  /takes? the guesswork/i,
  /dive into/i,
  new RegExp(`in today${APOSTROPHE}s world`, 'i'),
  /look no further/i,
];

const rel = (file: string): string => path.relative(SRC, file).replace(/\\/g, '/');

describe('copy style', () => {
  const all = walkFiles(SRC, TEXT);

  it('finds source files to check', () => {
    expect(all.length).toBeGreaterThan(0);
  });

  it('has no em dash under src/', () => {
    const found = all.flatMap((file) =>
      fs
        .readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((line, i) => (EM_DASH_RE.test(line) ? [`${rel(file)}:${i + 1}`] : []))
    );
    expect(found, `em dash (U+2014) found in:\n${found.join('\n')}`).toEqual([]);
  });

  it('has no stock filler phrase in pages or components', () => {
    const copy = all.filter((file) => /^(pages|components)\//.test(rel(file)));
    // Whitespace is collapsed first because prettier wraps a phrase across lines.
    const found = copy.flatMap((file) => {
      const text = fs.readFileSync(file, 'utf8').replace(/\s+/g, ' ');
      return STOCK_PHRASES.filter((re) => re.test(text)).map((re) => `${rel(file)}: ${re.source}`);
    });
    expect(found, `stock phrase found in:\n${found.join('\n')}`).toEqual([]);
  });
});
