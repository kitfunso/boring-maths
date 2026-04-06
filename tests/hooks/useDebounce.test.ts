import { render, act } from '@testing-library/preact';
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '../../src/hooks/useDebounce';

function DebounceHarness({ delay }: { delay: number }) {
  const [value, setValue] = useState(0);
  const debounced = useDebounce(value, delay);

  return h('div', null, [
    h('span', { 'data-testid': 'current' }, String(value)),
    h('span', { 'data-testid': 'debounced' }, String(debounced)),
    h('button', { onClick: () => setValue((v) => v + 1) }, 'increment'),
  ]);
}

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { container } = render(h(DebounceHarness, { delay: 200 }));
    const debounced = container.querySelector('[data-testid="debounced"]');
    expect(debounced?.textContent).toBe('0');
  });

  it('does not update debounced value before delay elapses', () => {
    const { container } = render(h(DebounceHarness, { delay: 300 }));
    const button = container.querySelector('button')!;

    act(() => {
      button.click();
    });

    // Current should be 1, debounced should still be 0
    expect(container.querySelector('[data-testid="current"]')?.textContent).toBe('1');
    expect(container.querySelector('[data-testid="debounced"]')?.textContent).toBe('0');
  });

  it('updates debounced value after delay elapses', () => {
    const { container } = render(h(DebounceHarness, { delay: 300 }));
    const button = container.querySelector('button')!;

    act(() => {
      button.click();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(container.querySelector('[data-testid="debounced"]')?.textContent).toBe('1');
  });

  it('resets the timer on rapid changes', () => {
    const { container } = render(h(DebounceHarness, { delay: 200 }));
    const button = container.querySelector('button')!;

    // Click three times rapidly
    act(() => {
      button.click();
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    act(() => {
      button.click();
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    act(() => {
      button.click();
    });

    // Still should be 0 since we haven't waited long enough after last change
    expect(container.querySelector('[data-testid="debounced"]')?.textContent).toBe('0');

    // Wait for the full delay after last change
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should now show 3 (all three clicks)
    expect(container.querySelector('[data-testid="debounced"]')?.textContent).toBe('3');
  });
});
