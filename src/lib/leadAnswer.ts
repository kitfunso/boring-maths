const NEEDS_QUESTION = /^(yes|no|not|it depends|maybe|sometimes|both|neither)\b/i;

export function leadAnswer(faq?: { question: string; answer: string }, budget = 280): string {
  if (!faq?.answer) return '';
  const text = NEEDS_QUESTION.test(faq.answer.trim())
    ? `${faq.question} ${faq.answer}`
    : faq.answer;
  const sentences = text.trim().split(/(?<=[.!?])\s+/);
  const kept: string[] = [];
  for (const sentence of sentences) {
    if (kept.length && [...kept, sentence].join(' ').length > budget) break;
    kept.push(sentence);
  }
  return kept.join(' ');
}
