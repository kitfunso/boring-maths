/**
 * DateRangePicker - unit tests (Task 4, 2026-07-19 plan)
 *
 * Locks the peak-aware calendar contract: an "Any dates" / formatted trigger
 * label, a start/end range state machine (second click sets the end, an earlier
 * click restarts), amber tinting of BA peak days via the shared isPeakIsoDate
 * definition, Clear resetting to ('', ''), and Escape closing the dialog.
 *
 * The system clock is pinned to 2026-09-01 (Date only, so Preact's effect
 * scheduler keeps its real timers) so "today" and the disabled-past-day cutoff
 * are deterministic and every date the tests click is in the future. September
 * 2026 is the default visible month; its dates are unambiguous vs the peak
 * calendar. Peak reference: PEAK_RANGES_2026 includes { from: '2026-09-11',
 * to: '2026-09-13' }, so 2026-09-12 is peak and 2026-09-16 (between the
 * 09-13 and 09-18 peak blocks) is off-peak.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import DateRangePicker from '../../src/components/calculators/AviosDestinationFinder/DateRangePicker';
import { ThemeProvider } from '../../src/components/ui/theme/ThemeContext';

function renderPicker(props: { valueFrom?: string; valueTo?: string } = {}) {
  const onChange = vi.fn();
  const utils = render(
    <ThemeProvider defaultColor="blue">
      <DateRangePicker
        id="dateRange"
        valueFrom={props.valueFrom ?? ''}
        valueTo={props.valueTo ?? ''}
        onChange={onChange}
      />
    </ThemeProvider>
  );
  return { onChange, ...utils };
}

describe('DateRangePicker', () => {
  beforeEach(() => {
    // Fake the Date clock only; leaving setTimeout/rAF real keeps Preact's
    // effect scheduler flushing normally under @testing-library/preact.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders "Any dates" when no range is set', () => {
    const { getByRole } = renderPicker();
    expect(getByRole('button', { name: 'Any dates' })).toBeInTheDocument();
  });

  it('renders the en-GB short-format label when a range is set', () => {
    const { getByRole } = renderPicker({ valueFrom: '2026-08-12', valueTo: '2026-08-26' });
    expect(getByRole('button', { name: '12 Aug 2026 - 26 Aug 2026' })).toBeInTheDocument();
  });

  it('emits onChange(from, to) when a start then a later end are clicked', () => {
    const { onChange, getByRole } = renderPicker();
    fireEvent.click(getByRole('button', { name: 'Any dates' }));
    fireEvent.click(getByRole('button', { name: '10 September 2026' }));
    fireEvent.click(getByRole('button', { name: '16 September 2026' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-09-10', '2026-09-16');
  });

  it('restarts the range when a day before the current start is clicked', () => {
    const { onChange, getByRole } = renderPicker();
    fireEvent.click(getByRole('button', { name: 'Any dates' }));
    fireEvent.click(getByRole('button', { name: '16 September 2026' }));
    fireEvent.click(getByRole('button', { name: '10 September 2026' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-09-10', '');
  });

  it('tints a peak day amber and leaves an off-peak day plain', () => {
    const { getByRole } = renderPicker();
    fireEvent.click(getByRole('button', { name: 'Any dates' }));
    // 2026-09-12 is inside PEAK_RANGES_2026 { from: '2026-09-11', to: '2026-09-13' }.
    const peakDay = getByRole('button', { name: '12 September 2026, peak pricing' });
    const offPeakDay = getByRole('button', { name: '16 September 2026' });
    expect(peakDay.className).toContain('bg-amber-500/20');
    expect(offPeakDay.className).not.toContain('amber');
  });

  it('clears both dates to empty when the inline clear button is pressed', () => {
    const { onChange, getByLabelText } = renderPicker({
      valueFrom: '2026-09-10',
      valueTo: '2026-09-16',
    });
    fireEvent.click(getByLabelText('Clear travel dates'));
    expect(onChange).toHaveBeenCalledWith('', '');
  });

  it('closes the dialog on Escape', () => {
    const { getByRole, queryByRole } = renderPicker();
    fireEvent.click(getByRole('button', { name: 'Any dates' }));
    expect(getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(getByRole('dialog'), { key: 'Escape' });
    expect(queryByRole('dialog')).toBeNull();
  });
});
