import { describe, it, expect } from 'vitest';
import { leadAnswer } from '../../src/lib/leadAnswer';

const faq = (answer: string, question = 'Q?') => ({ question, answer });

describe('leadAnswer', () => {
  it('keeps whole sentences within the budget', () => {
    expect(leadAnswer(faq('One two three. Four five six. Seven eight nine.'), 30)).toBe(
      'One two three. Four five six.'
    );
  });

  it('does not split a decimal number into two sentences', () => {
    expect(leadAnswer(faq('Plan 1.5 drinks per guest per hour.'), 20)).toBe(
      'Plan 1.5 drinks per guest per hour.'
    );
  });

  it('returns the first sentence even when it alone busts the budget', () => {
    expect(leadAnswer(faq('A very long single sentence here. Second.'), 5)).toBe(
      'A very long single sentence here.'
    );
  });

  it('prefixes the question when the answer cannot stand alone', () => {
    expect(leadAnswer(faq('No. Sales tax is set by each state.', 'Is there a federal sales tax?'))).toBe(
      'Is there a federal sales tax? No. Sales tax is set by each state.'
    );
  });

  it('leaves a self-contained answer unprefixed', () => {
    expect(leadAnswer(faq('Nothing beats a good roast.', 'Q?'))).toBe('Nothing beats a good roast.');
  });

  it('is empty for a missing faq', () => {
    expect(leadAnswer(undefined)).toBe('');
  });
});
