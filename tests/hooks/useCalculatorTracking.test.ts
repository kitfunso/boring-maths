import { render, act } from '@testing-library/preact';
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCalculatorTracking } from '../../src/hooks/useCalculatorTracking';

function TrackingHarness({ name, hasInteracted }: { name: string; hasInteracted: boolean }) {
  useCalculatorTracking(name, hasInteracted);
  return h('div', null, 'tracker');
}

function InteractiveHarness({ name }: { name: string }) {
  const [interacted, setInteracted] = useState(false);
  useCalculatorTracking(name, interacted);
  return h('div', null, [h('button', { onClick: () => setInteracted(true) }, 'interact')]);
}

describe('useCalculatorTracking', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (window as any).trackCalculatorUse = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as any).trackCalculatorUse;
  });

  it('does not track when hasInteracted is false', () => {
    render(h(TrackingHarness, { name: 'Test Calc', hasInteracted: false }));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(window.trackCalculatorUse).not.toHaveBeenCalled();
  });

  it('tracks after delay when hasInteracted is true', () => {
    render(h(TrackingHarness, { name: 'Tip Calculator', hasInteracted: true }));

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(window.trackCalculatorUse).toHaveBeenCalledWith('Tip Calculator');
  });

  it('tracks only once per session even with re-renders', () => {
    const { rerender } = render(
      h(TrackingHarness, { name: 'Mortgage Calculator', hasInteracted: true })
    );

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Re-render with same props
    rerender(h(TrackingHarness, { name: 'Mortgage Calculator', hasInteracted: true }));

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(window.trackCalculatorUse).toHaveBeenCalledTimes(1);
  });

  it('does not call tracking if window.trackCalculatorUse is undefined', () => {
    delete (window as any).trackCalculatorUse;

    // Should not throw
    expect(() => {
      render(h(TrackingHarness, { name: 'Test', hasInteracted: true }));
      act(() => {
        vi.advanceTimersByTime(1500);
      });
    }).not.toThrow();
  });
});
