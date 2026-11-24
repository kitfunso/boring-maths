import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { calculators } from '@/lib/calculators';

const LLMS_PATH = path.resolve(__dirname, '..', '..', 'public', 'llms.txt');

describe('llms.txt calculator entries resolve to registry pages', () => {
  const registryHrefs = new Set(calculators.map((c) => c.href));
  const llms = fs.readFileSync(LLMS_PATH, 'utf8');
  const urls = [...llms.matchAll(/https:\/\/boring-math\.com(\/calculators\/[a-z0-9-]+)/g)].map(
    (m) => `${m[1]}/`
  );

  it('lists at least one calculator URL', () => {
    expect(urls.length).toBeGreaterThan(0);
  });

  it('every llms.txt calculator URL exists in the registry', () => {
    const dead = [...new Set(urls)].filter((href) => !registryHrefs.has(href));
    expect(dead, `dead llms.txt entries:\n${dead.join('\n')}`).toEqual([]);
  });

  it('the "Browse all N calculators" count matches the registry', () => {
    const match = llms.match(/Browse all (\d+) calculators/);
    expect(match, 'llms.txt must keep the "Browse all N calculators" line').not.toBeNull();
    expect(Number(match![1]), 'llms.txt calculator count drifted from the registry').toBe(
      calculators.length
    );
  });
});
