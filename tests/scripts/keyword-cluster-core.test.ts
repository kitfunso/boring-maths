import { describe, expect, it } from 'vitest';
import {
  businessIntentScore,
  difficultyScore,
  enrichKeywords,
  summariseClusters,
} from '../../scripts/seo/keyword-cluster-core.mjs';

describe('keyword cluster pipeline core', () => {
  it('keeps explicit difficulty when provided', () => {
    const score = difficultyScore({ keyword: 'uk tax calculator', keywordDifficulty: '67' });
    expect(score).toBe(67);
  });

  it('scores calculator queries with stronger intent than research-only queries', () => {
    const transactional = businessIntentScore('uk salary sacrifice calculator');
    const informational = businessIntentScore('what is salary sacrifice');

    expect(transactional).toBeGreaterThan(informational);
    expect(transactional).toBeGreaterThanOrEqual(70);
  });

  it('assigns same cluster for close variants and computes cluster size', () => {
    const rows = enrichKeywords([
      { keyword: 'uk tax calculator', volume: '1200' },
      { keyword: 'uk tax rates', volume: '800' },
      { keyword: 'tax on salary uk', volume: '600' },
    ]);

    const clusterIds = new Set(rows.map((row) => row.cluster_id));
    expect(clusterIds.size).toBe(1);
    expect(rows[0].cluster_size).toBe(3);
    expect(rows[1].cluster_size).toBe(3);
    expect(rows[2].cluster_size).toBe(3);
  });

  it('builds sorted cluster summary by priority', () => {
    const enriched = enrichKeywords([
      { keyword: 'uk tax calculator', volume: '3000' },
      { keyword: 'tax take home pay', volume: '1700' },
      { keyword: 'wedding speech jokes', volume: '3000' },
    ]);

    const summary = summariseClusters(enriched);
    expect(summary.length).toBeGreaterThan(0);

    for (let i = 0; i < summary.length - 1; i += 1) {
      expect(summary[i].avg_priority_score).toBeGreaterThanOrEqual(
        summary[i + 1].avg_priority_score
      );
    }
  });
});
