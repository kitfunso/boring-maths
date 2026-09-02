# Avios peak / off-peak calendar

Data lives in `src/components/calculators/AviosDestinationFinder/data/peakCalendar.ts`.
`PEAK_RANGES` lists the peak dates; every other date in a published year is off-peak.
`PEAK_INTERVALS` and `isPeakIsoDate` rebuild from `PEAK_RANGES` automatically.

## Sources

- https://awardwallet.com/airlines/avios-peak-calendar/ (fetched 2026-07-19)
- https://www.aviosintelligence.com/reports/avios-peak-off-peak-dates (corroborating)

Dates after `CALENDAR_PUBLISHED_THROUGH` are treated as "could be either season",
because BA publishes the calendar one year at a time.

## Annual update, when the next year publishes

1. Append the new year's ranges to `PEAK_RANGES`.
2. Bump `CALENDAR_PUBLISHED_THROUGH`.
3. Bump `DATA_LAST_VERIFIED`.
4. Re-verify prices against the source URL in `destinations.ts`. Update the anchors
   and tier pins in the test file if BA repriced.

The monthly `avios-data-freshness` workflow flags source drift on its own. After you
re-verify, reseed the baselines:

```
node scripts/data/check-avios-sources.mjs --update
```
