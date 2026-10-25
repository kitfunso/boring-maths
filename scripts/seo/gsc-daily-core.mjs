// Pure daily-series logic split out of gsc-pull.mjs so tests can import it without the OAuth and CLI code.
export const CLIFF_WINDOW = 14;
export const CLIFF_BASELINE = 7;
const CLIFF_RATIO = 0.25;

// UTC math so DST never shifts a calendar day.
export function addDays(isoDate, n) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// GSC omits zero-row days, so a site that goes dark at the end of the window ends its rows early and
// looks steady. Fill first row .. lastDate (or the last row, if later) so the dead days count as zeros.
export function fillDailySeries(rows, lastDate) {
  if (rows.length === 0) return [];
  const byDate = new Map(rows.map((r) => [r.keys[0], r]));
  const dates = [...byDate.keys()].sort();
  const end = lastDate > dates.at(-1) ? lastDate : dates.at(-1);
  const series = [];
  for (let date = dates[0]; date <= end; date = addDays(date, 1)) {
    const r = byDate.get(date);
    series.push({
      date,
      clicks: r ? r.clicks : 0,
      impressions: r ? r.impressions : 0,
      position: r ? r.position : null,
      filled: !r,
    });
  }
  return series;
}

/** First day in the last CLIFF_WINDOW below CLIFF_RATIO of the prior CLIFF_BASELINE-day median. */
export function findCliff(series) {
  for (let i = series.length - CLIFF_WINDOW; i < series.length; i += 1) {
    if (i < CLIFF_BASELINE) continue;
    const base = median(series.slice(i - CLIFF_BASELINE, i).map((d) => d.impressions));
    if (series[i].impressions < base * CLIFF_RATIO) {
      return { date: series[i].date, impressions: series[i].impressions, median: base };
    }
  }
  return null;
}
