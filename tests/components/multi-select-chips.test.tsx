/**
 * MultiSelectChips - "All" chip regression tests (Task 2, 2026-07-19 plan)
 *
 * Locks the optional `allLabel` prop contract: a leading chip that is active
 * exactly when `selected` is empty, clicking it calls onChange([]), and it
 * stays a no-op-safe idempotent action when already active.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import MultiSelectChips from '../../src/components/calculators/AviosDestinationFinder/MultiSelectChips';
import { ThemeProvider } from '../../src/components/ui/theme/ThemeContext';

const OPTIONS = [
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
];

function renderChips({
  allLabel,
  selected = [],
}: { allLabel?: string; selected?: readonly string[] } = {}) {
  const onChange = vi.fn();
  const utils = render(
    <ThemeProvider defaultColor="blue">
      <MultiSelectChips
        options={OPTIONS}
        selected={selected}
        onChange={onChange}
        ariaLabel="Filter by region"
        allLabel={allLabel}
      />
    </ThemeProvider>
  );
  return { onChange, ...utils };
}

describe('MultiSelectChips - All chip', () => {
  it('does not render an All chip when allLabel is not set', () => {
    const { queryByText } = renderChips();
    expect(queryByText('All')).toBeNull();
  });

  it('All chip is active when selection is empty', () => {
    const { getByText } = renderChips({ allLabel: 'All' });
    expect(getByText('All').getAttribute('aria-pressed')).toBe('true');
  });

  it('selecting an option deactivates the All chip', () => {
    const { getByText } = renderChips({ allLabel: 'All', selected: ['europe'] });
    expect(getByText('All').getAttribute('aria-pressed')).toBe('false');
    expect(getByText('Europe').getAttribute('aria-pressed')).toBe('true');
  });

  it('clicking All while a filter is selected clears the selection', () => {
    const { onChange, getByText } = renderChips({ allLabel: 'All', selected: ['europe'] });
    fireEvent.click(getByText('All'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('clicking All while already active is an idempotent onChange([]) call', () => {
    const { onChange, getByText } = renderChips({ allLabel: 'All', selected: [] });
    fireEvent.click(getByText('All'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('clicking All clears the selection and the chip reactivates once selected becomes empty', () => {
    const onChange = vi.fn();
    const { getByText, rerender } = render(
      <ThemeProvider defaultColor="blue">
        <MultiSelectChips
          options={OPTIONS}
          selected={['europe']}
          onChange={onChange}
          ariaLabel="Filter by region"
          allLabel="All"
        />
      </ThemeProvider>
    );
    expect(getByText('All').getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(getByText('All'));
    expect(onChange).toHaveBeenCalledWith([]);

    rerender(
      <ThemeProvider defaultColor="blue">
        <MultiSelectChips
          options={OPTIONS}
          selected={[]}
          onChange={onChange}
          ariaLabel="Filter by region"
          allLabel="All"
        />
      </ThemeProvider>
    );
    expect(getByText('All').getAttribute('aria-pressed')).toBe('true');
  });
});
