/**
 * DateRangePicker - peak-aware travel date-range calendar for the Avios finder.
 *
 * Replaces the two native <input type="date"> controls with one trigger button
 * and a hand-rolled month calendar popover. Peak-pricing days are tinted amber
 * using the shared isPeakIsoDate definition so the calendar and the calculation
 * layer agree on what "peak" means. No new dependencies; all date maths runs in
 * UTC (the Date.parse(iso + 'T00:00:00Z') idiom shared with calculations.ts) so
 * DST never shifts a day. The one exception is the "before today" disable
 * cutoff, which uses the LOCAL calendar date (amendment 8): a user in London at
 * 23:00 should not see tomorrow's UTC date already greyed out.
 *
 * Positioning (amendment 2): the popover is position:fixed at ALL widths. The
 * finder Card sets overflow-hidden, which clips an absolutely-positioned popover
 * at md+ widths; a fixed popover is laid out against the viewport instead. On
 * open it reads the trigger's getBoundingClientRect and places itself below,
 * horizontally clamped on-screen. A fixed element does not track the trigger
 * once the page moves, so it closes on scroll or resize.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { useTheme } from '../../ui/theme/ThemeContext';
import type { ColorTokens } from '../../ui/theme/colors';
import { isPeakIsoDate } from './data/peakCalendar';

export interface DateRangePickerProps {
  /** Trigger element id; the sibling <Label htmlFor> must match this. */
  readonly id: string;
  /** Selected start date, ISO yyyy-mm-dd, or '' when unset. */
  readonly valueFrom: string;
  /** Selected end date, ISO yyyy-mm-dd, or '' when unset. */
  readonly valueTo: string;
  /** Emits both ISO strings ('' when cleared) on every change. */
  readonly onChange: (from: string, to: string) => void;
}

interface YearMonth {
  readonly year: number;
  /** 0-indexed month (0 = January). */
  readonly month: number;
}

/** Weeks start Monday on the UK BA site. */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
/** Navigation upper bound: December 2027 (0-indexed month 11). */
const NAV_UPPER: YearMonth = { year: 2027, month: 11 };
const UPPER_ISO = '2027-12-31';
/** Desired popover width; shrinks to fit narrow viewports. */
const POPOVER_WIDTH = 320;
const VIEWPORT_MARGIN = 8;

// Formatters are pinned to UTC so an ISO date renders as itself regardless of
// the viewer's timezone (a Date at 00:00Z would otherwise slip a day in the
// Americas). en-GB gives "12 Aug 2026" / "12 August 2026".
const SHORT_FMT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const LONG_FMT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const TITLE_FMT = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** ISO yyyy-mm-dd for a year, 0-indexed month and day. */
function isoOf(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function utcOf(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

function fmtShort(iso: string): string {
  return SHORT_FMT.format(utcOf(iso));
}

function fmtLong(iso: string): string {
  return LONG_FMT.format(utcOf(iso));
}

function monthTitle(m: YearMonth): string {
  return TITLE_FMT.format(Date.UTC(m.year, m.month, 1));
}

/** Local calendar 'today' as ISO. The disable cutoff is local, not UTC. */
function localTodayIso(): string {
  const now = new Date();
  return isoOf(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Days in a 0-indexed month (day 0 of the next month is the last day). */
function daysInMonth(m: YearMonth): number {
  return new Date(Date.UTC(m.year, m.month + 1, 0)).getUTCDate();
}

/** Monday-indexed weekday (0 = Mon .. 6 = Sun) of the 1st of the month. */
function mondayIndexOfFirst(m: YearMonth): number {
  const jsDay = new Date(Date.UTC(m.year, m.month, 1)).getUTCDay(); // 0 = Sun
  return (jsDay + 6) % 7;
}

function monthOfIso(iso: string): YearMonth {
  return { year: Number(iso.slice(0, 4)), month: Number(iso.slice(5, 7)) - 1 };
}

/** Comparable ordinal for a year/month, for bound checks. */
function monthOrdinal(m: YearMonth): number {
  return m.year * 12 + m.month;
}

function addMonths(m: YearMonth, delta: number): YearMonth {
  const v = m.year * 12 + m.month + delta;
  return { year: Math.floor(v / 12), month: ((v % 12) + 12) % 12 };
}

/** iso shifted by whole days, staying on the UTC day grid. */
function shiftIso(iso: string, days: number): string {
  return new Date(utcOf(iso) + days * 86_400_000).toISOString().slice(0, 10);
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}

function dayClassName(
  state: {
    readonly isEndpoint: boolean;
    readonly inRange: boolean;
    readonly peak: boolean;
    readonly isToday: boolean;
    readonly isPast: boolean;
  },
  tokens: ColorTokens
): string {
  const base =
    'h-9 w-full rounded-md text-sm flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/60';
  let tone: string;
  if (state.isEndpoint) tone = `${tokens.bg600} text-white`;
  else if (state.inRange) tone = 'bg-white/10 text-[var(--color-cream)]';
  else if (state.peak) tone = 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30';
  else tone = 'text-[var(--color-cream)] hover:bg-white/10';
  const today = state.isToday && !state.isEndpoint ? ' ring-1 ring-white/60' : '';
  const past = state.isPast ? ' opacity-40 cursor-not-allowed' : '';
  return `${base} ${tone}${today}${past}`;
}

export default function DateRangePicker({
  id,
  valueFrom,
  valueTo,
  onChange,
}: DateRangePickerProps) {
  const { tokens } = useTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  /** Set just before a focusIso change that should also move DOM focus. */
  const shouldFocusDay = useRef(false);

  const todayIso = localTodayIso();

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: POPOVER_WIDTH });
  const [view, setView] = useState<YearMonth>(() => monthOfIso(valueFrom || todayIso));
  // Draft selection while the popover is open; seeded from props on open so the
  // component works standalone (first click sets start, second sets end) even
  // before the parent round-trips the value back through props.
  const [sel, setSel] = useState({ from: valueFrom, to: valueTo });
  const [focusIso, setFocusIso] = useState(valueFrom || todayIso);

  /** Focus never lands on a disabled past day, so clamp it into range. */
  function clampFocusable(iso: string): string {
    if (iso < todayIso) return todayIso;
    if (iso > UPPER_ISO) return UPPER_ISO;
    return iso;
  }

  function openPopover(): void {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const clientWidth = document.documentElement.clientWidth;
    const width = Math.min(POPOVER_WIDTH, clientWidth - VIEWPORT_MARGIN * 2);
    const left = clamp(rect.left, VIEWPORT_MARGIN, clientWidth - width - VIEWPORT_MARGIN);
    setPos({ top: rect.bottom + VIEWPORT_MARGIN, left, width });

    const seed = clampFocusable(valueFrom || todayIso);
    setSel({ from: valueFrom, to: valueTo });
    setView(monthOfIso(seed));
    setFocusIso(seed);
    shouldFocusDay.current = true;
    setOpen(true);
  }

  function closePopover(returnFocus: boolean): void {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function clearRange(): void {
    setSel({ from: '', to: '' });
    onChange('', '');
  }

  function selectDay(iso: string): void {
    if (iso < todayIso) return; // defensive: past days are also disabled
    const { from, to } = sel;
    let next: { from: string; to: string };
    if (!from || (from && to)) next = { from: iso, to: '' };
    else if (iso < from) next = { from: iso, to: '' };
    else next = { from, to: iso };
    setSel(next);
    setFocusIso(iso);
    shouldFocusDay.current = true;
    onChange(next.from, next.to);
  }

  function goMonth(delta: number): void {
    const nv = addMonths(view, delta);
    setView(nv);
    // Keep the roving-tabindex target inside the visible month, but do not steal
    // focus from the prev/next button the user is clicking.
    setFocusIso(clampFocusable(isoOf(nv.year, nv.month, 1)));
  }

  function onGridKeyDown(e: KeyboardEvent): void {
    const deltas: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const delta = deltas[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const next = clampFocusable(shiftIso(focusIso, delta));
    setView(monthOfIso(next));
    setFocusIso(next);
    shouldFocusDay.current = true;
  }

  // Move DOM focus to the roving day only when a keyboard move or selection
  // asked for it (preventScroll so focusing never triggers the scroll-close).
  useEffect(() => {
    if (!open || !shouldFocusDay.current) return;
    shouldFocusDay.current = false;
    const btn = popoverRef.current?.querySelector<HTMLButtonElement>(
      `button[data-iso="${focusIso}"]`
    );
    btn?.focus({ preventScroll: true });
  }, [open, focusIso, view]);

  // Clamp the popover up if its measured height would run off the bottom edge.
  useLayoutEffect(() => {
    if (!open || !popoverRef.current) return;
    const height = popoverRef.current.offsetHeight;
    const clientHeight = document.documentElement.clientHeight;
    setPos((p) => {
      const top = Math.min(
        p.top,
        Math.max(VIEWPORT_MARGIN, clientHeight - height - VIEWPORT_MARGIN)
      );
      return top === p.top ? p : { ...p, top };
    });
  }, [open]);

  // Close on scroll / resize / outside-click / Escape while open.
  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = (): void => setOpen(false);
    const onDocMouseDown = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const isSet = valueFrom !== '' || valueTo !== '';
  let triggerLabel: string;
  if (!valueFrom && !valueTo) triggerLabel = 'Any dates';
  else if (valueFrom && valueTo) triggerLabel = `${fmtShort(valueFrom)} - ${fmtShort(valueTo)}`;
  else triggerLabel = fmtShort(valueFrom || valueTo);

  // Navigation lower bound (amendment 6): a persisted past start stays reachable
  // so it can be re-edited, so the bound is the earlier of this month and it.
  const currentMonth = monthOfIso(todayIso);
  const fromMonth = valueFrom ? monthOfIso(valueFrom) : null;
  const lowerBound =
    fromMonth && monthOrdinal(fromMonth) < monthOrdinal(currentMonth) ? fromMonth : currentMonth;
  const canPrev = monthOrdinal(view) > monthOrdinal(lowerBound);
  const canNext = monthOrdinal(view) < monthOrdinal(NAV_UPPER);

  // Build the Monday-first calendar matrix for the visible month.
  const lead = mondayIndexOfFirst(view);
  const total = daysInMonth(view);
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let d = 1; d <= total; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const navBtn =
    'p-1.5 rounded-md text-[var(--color-cream)] hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/60';
  const footerBtn =
    'px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/60';

  return (
    <div className="relative">
      <button
        id={id}
        ref={triggerRef}
        type="button"
        onClick={openPopover}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 text-left border rounded-[10px] transition-all duration-200 bg-[var(--color-night)] text-[var(--color-cream)] py-4 md:py-3 text-lg px-4 border-white/10 focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/20"
      >
        <span className={isSet ? '' : 'text-[var(--color-muted)]'}>{triggerLabel}</span>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          className="text-[var(--color-muted)] shrink-0"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        </svg>
      </button>

      {isSet && (
        <button
          type="button"
          aria-label="Clear travel dates"
          onClick={(e) => {
            e.stopPropagation();
            clearRange();
          }}
          className="absolute right-11 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--color-muted)] hover:text-[var(--color-cream)] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/60"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="false"
          aria-label="Choose travel dates"
          className="fixed z-20 bg-[var(--color-night)] border border-white/10 rounded-xl shadow-xl p-4"
          style={{ top: `${pos.top}px`, left: `${pos.left}px`, width: `${pos.width}px` }}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => goMonth(-1)}
              disabled={!canPrev}
              className={navBtn}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="text-sm font-medium text-[var(--color-cream)]">{monthTitle(view)}</div>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => goMonth(1)}
              disabled={!canNext}
              className={navBtn}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div role="grid" aria-label={monthTitle(view)} onKeyDown={onGridKeyDown}>
            <div role="row" className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  role="columnheader"
                  className="text-center text-[10px] uppercase tracking-wider text-[var(--color-muted)] py-1"
                >
                  {w}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div role="row" key={wi} className="grid grid-cols-7 gap-0.5">
                {week.map((day, di) => {
                  if (day === null) {
                    return <div role="gridcell" key={di} aria-hidden="true" className="h-9" />;
                  }
                  const iso = isoOf(view.year, view.month, day);
                  const peak = isPeakIsoDate(iso);
                  const isFrom = sel.from === iso;
                  const isTo = sel.to !== '' && sel.to === iso;
                  const isEndpoint = isFrom || isTo;
                  const inRange =
                    sel.from !== '' && sel.to !== '' && iso > sel.from && iso < sel.to;
                  const isToday = iso === todayIso;
                  const isPast = iso < todayIso;
                  return (
                    <div role="gridcell" key={di}>
                      <button
                        type="button"
                        data-iso={iso}
                        disabled={isPast}
                        aria-label={peak ? `${fmtLong(iso)}, peak pricing` : fmtLong(iso)}
                        aria-pressed={isEndpoint}
                        aria-current={isToday ? 'date' : undefined}
                        tabIndex={iso === focusIso ? 0 : -1}
                        onClick={() => selectDay(iso)}
                        className={dayClassName(
                          { isEndpoint, inRange, peak, isToday, isPast },
                          tokens
                        )}
                      >
                        {day}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500/60"
                aria-hidden="true"
              />
              BA peak pricing
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearRange}
                className={`${footerBtn} text-[var(--color-muted)] hover:text-[var(--color-cream)] hover:bg-white/10`}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => closePopover(true)}
                className={`${footerBtn} ${tokens.bg600} text-white hover:opacity-90`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
