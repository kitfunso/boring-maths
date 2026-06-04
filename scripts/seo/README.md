# SEO Workflows (Boring Maths)

Four workflows now exist:

0. `seo:gsc-pull` - fetch the latest Search Console data via the official API
1. `seo:cluster` - keyword clustering + intent + difficulty + priority scoring
2. `seo:gsc-refresh` - GSC query coverage gap detection per page
3. `seo:internal-links` - semantic internal linking suggestions by topic similarity

## 0) GSC pull (get the latest data)

Pulls pages / queries / query+page for the last 28 days straight from Search
Console and writes them to `gsc-export/<YYYY-MM-DD>/` in the same schema the
analysis tools already read. Zero runtime deps (Node 18+ fetch + built-in http).

One-time setup:

1. Google Cloud Console > APIs & Services > Library > enable **Google Search Console API**.
2. Credentials > Create credentials > OAuth client ID > Application type **Desktop app**.
3. On the OAuth consent screen, add your Google account under **Test users**.
4. Download the client JSON and save it as `scripts/seo/.gsc-client.json` (gitignored).

Then:

```bash
npm run seo:gsc-pull -- --list-sites   # first run opens a browser for consent; lists your properties
npm run seo:gsc-pull                    # pulls 28d into gsc-export/<today>/
python scripts/gsc_analysis.py          # auto-reads the newest export folder
```

Flags: `--site "<property>"` (e.g. `sc-domain:boring-math.com`), `--days <n>`,
`--start/--end <YYYY-MM-DD>`, `--fresh` (include not-yet-finalised data),
`--reauth` (force fresh consent). The refresh token is cached in
`scripts/seo/.gsc-token.json` (gitignored) so later runs are non-interactive.

## 1) Keyword clustering

Command:

```bash
npm run seo:cluster -- --input <keywords.csv> [--output <clustered.csv>] [--summary <clusters.csv>]
```

Input columns (minimum):
- `keyword`

Optional columns:
- `volume` (or `searchVolume`, `search_volume`, `impressions`)
- `keywordDifficulty` (or `keyword_difficulty`, `difficulty`)

Output columns include:
- `cluster_id`, `cluster_label`, `cluster_size`
- `business_intent_score`
- `keyword_difficulty_score`
- `priority_score`

## 2) GSC refresh opportunities

Command:

```bash
npm run seo:gsc-refresh -- --input <gsc.csv> [--output <opportunities.csv>] [--summary <pages.csv>] [--repoRoot <path>]
```

Input columns (minimum):
- `page` (URL or path)
- `query`
- `impressions`
- `position`

Optional columns:
- `clicks`

Output columns include:
- `coverage_ratio`
- `missing_terms`
- `opportunity_score`
- `source_file`

This script maps GSC pages to Astro files in `src/pages/**` and compares query terms to page source text.

## 3) Internal linking map

Command:

```bash
npm run seo:internal-links -- [--repoRoot <path>] [--output <map.csv>] [--summary <summary.csv>] [--maxLinksPerPage <n>] [--minSimilarity <n>]
```

Default behavior:
- scans `src/pages/calculators/**/*.astro`
- suggests top semantic links per source page

Output columns include:
- `source_url`, `target_url`
- `similarity_score`
- `shared_terms`
- `source_file`, `target_file`

## Quick sequence

```bash
# 1) cluster new keyword universe
npm run seo:cluster -- --input data/keywords.csv

# 2) find refresh gaps from GSC export
npm run seo:gsc-refresh -- --input data/gsc-pages-queries.csv --repoRoot .

# 3) generate internal linking map
npm run seo:internal-links -- --repoRoot .
```
