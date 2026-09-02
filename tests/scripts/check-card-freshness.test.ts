import { describe, expect, it } from 'vitest';
import { staleRows } from '../../scripts/data/check-card-freshness.mjs';

const FRESH_SOURCE = `
export const CARDS = [
  {
    id: 'fresh-card',
    name: 'Fresh Card',
    sourceUrl: 'https://example.com/fresh',
    lastVerified: '2026-08-01',
  },
];
`;

const MIXED_SOURCE = `
export const CARDS = [
  {
    id: 'fresh-card',
    sourceUrl: 'https://example.com/fresh',
    lastVerified: '2026-08-01',
  },
  {
    id: 'stale-card',
    sourceUrl: 'https://example.com/stale',
    lastVerified: '2026-01-01',
  },
];
`;

describe('check-card-freshness staleRows', () => {
  it('finds nothing stale when every row is inside the window', () => {
    expect(staleRows(FRESH_SOURCE, '2026-09-02', 120)).toEqual([]);
  });

  it('flags a row whose lastVerified is older than the window', () => {
    expect(staleRows(MIXED_SOURCE, '2026-09-02', 120)).toEqual([
      { id: 'stale-card', lastVerified: '2026-01-01' },
    ]);
  });

  it('respects a custom days window', () => {
    expect(staleRows(FRESH_SOURCE, '2026-09-02', 10)).toEqual([
      { id: 'fresh-card', lastVerified: '2026-08-01' },
    ]);
  });
});
