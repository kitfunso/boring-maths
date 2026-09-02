import { describe, expect, it } from 'vitest';
import { CARDS } from '../../src/components/calculators/CardPerksCalculator/data/cards';

// Readers see these notes in the expanded row, so a field name like fxFeePct is a content bug.
const FIELD_NAME = /\b[a-z]+[A-Z][A-Za-z]+\b/;

describe('card notes', () => {
  it('use plain words, never field names', () => {
    for (const card of CARDS) {
      const texts = [...(card.notes ?? []), card.welcomeBonus?.note ?? ''];
      for (const text of texts) {
        expect(text, `${card.id}: ${text}`).not.toMatch(FIELD_NAME);
      }
    }
  });
});
