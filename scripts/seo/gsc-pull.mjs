#!/usr/bin/env node
/**
 * GSC Pull - fetch the latest Search Console data via the official API.
 *
 * Zero runtime dependencies (Node 18+ global fetch + built-in http).
 * OAuth 2.0 installed-app (loopback) flow: authorise once in a browser,
 * the refresh token is cached, every later run is non-interactive.
 *
 * Output matches the existing manual-export schema so scripts/gsc_analysis.py
 * and seo:gsc-refresh keep working unchanged:
 *   gsc-export/<YYYY-MM-DD>/gsc-pages-28d.json         ({rows, responseAggregationType})
 *   gsc-export/<YYYY-MM-DD>/gsc-queries-28d.json        ({rows, responseAggregationType})
 *   gsc-export/<YYYY-MM-DD>/gsc-query-page-28d.json     (bare rows array)
 *   gsc-export/<YYYY-MM-DD>/gsc-countries-28d.json      ({rows, responseAggregationType})
 *   gsc-export/<YYYY-MM-DD>/gsc-country-page-28d.json   ({rows, responseAggregationType})
 *   gsc-export/<YYYY-MM-DD>/gsc-country-query-28d.json  ({rows, responseAggregationType})
 *   gsc-export/<YYYY-MM-DD>/_pull-meta.json             (provenance)
 *
 * Setup (one time):
 *   1. Google Cloud Console > APIs & Services > Library > enable "Google Search Console API".
 *   2. Credentials > Create credentials > OAuth client ID > Application type "Desktop app".
 *   3. Download the JSON, save it as scripts/seo/.gsc-client.json (gitignored).
 *      (On the OAuth consent screen, add your Google account as a Test user.)
 *   4. npm run seo:gsc-pull -- --list-sites      # browser consent on first run
 *   5. npm run seo:gsc-pull                       # pulls 28d into gsc-export/<today>/
 *
 * Flags:
 *   --list-sites          list the GSC properties the account can access, then exit
 *   --site <property>     e.g. "sc-domain:boring-math.com" or "https://boring-math.com/"
 *   --days <n>            lookback window (default 28)
 *   --start <YYYY-MM-DD>  explicit start (overrides --days)
 *   --end <YYYY-MM-DD>    explicit end (default: today)
 *   --fresh               include not-yet-finalised data (dataState=all; default final)
 *   --client <path>       OAuth client secret JSON (default scripts/seo/.gsc-client.json)
 *   --label <name>        output folder name under gsc-export/ (default: end date)
 *   --reauth              force a fresh browser consent
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getAccessToken, fail } from './gsc-auth.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const API_BASE = 'https://searchconsole.googleapis.com/webmasters/v3';
const ROW_LIMIT = 25000; // API max per page

// ---------------------------------------------------------------- args

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

// ---------------------------------------------------------------- dates

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function resolveRange(args) {
  const end = args.end ? new Date(`${args.end}T00:00:00`) : new Date();
  let start;
  if (args.start) {
    start = new Date(`${args.start}T00:00:00`);
  } else {
    const days = Number(args.days) || 28;
    start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
  }
  return { startDate: fmtDate(start), endDate: fmtDate(end) };
}

// ---------------------------------------------------------------- api

async function apiGet(urlPath, accessToken) {
  const res = await fetch(`${API_BASE}${urlPath}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!res.ok) fail(`API GET ${urlPath} failed (${res.status}): ${JSON.stringify(json)}`);
  return json;
}

async function listSites(accessToken) {
  const json = await apiGet('/sites', accessToken);
  return (json.siteEntry || []).map((s) => ({ url: s.siteUrl, level: s.permissionLevel }));
}

async function resolveSite(args, accessToken) {
  if (args.site) return args.site;
  const sites = await listSites(accessToken);
  const matches = sites.filter((s) => s.url.includes('boring-math.com'));
  if (matches.length === 1) {
    console.log(`Using property: ${matches[0].url}`);
    return matches[0].url;
  }
  if (matches.length === 0) {
    fail(
      `No boring-math.com property found for this account. Available:\n` +
        sites.map((s) => `  ${s.url} (${s.level})`).join('\n') +
        `\nPass the exact one with --site.`,
    );
  }
  fail(
    `Multiple boring-math.com properties found. Pass one with --site:\n` +
      matches.map((s) => `  ${s.url}`).join('\n'),
  );
}

/** searchAnalytics.query with row pagination. */
async function queryAll(site, accessToken, body) {
  const rows = [];
  let startRow = 0;
  let aggType = 'auto';
  for (;;) {
    const res = await fetch(
      `${API_BASE}/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...body, rowLimit: ROW_LIMIT, startRow }),
      },
    );
    const json = await res.json();
    if (!res.ok) fail(`searchAnalytics.query failed (${res.status}): ${JSON.stringify(json)}`);
    const batch = json.rows || [];
    if (json.responseAggregationType) aggType = json.responseAggregationType;
    rows.push(...batch);
    if (batch.length < ROW_LIMIT) break;
    startRow += ROW_LIMIT;
  }
  return { rows, responseAggregationType: aggType };
}

// ---------------------------------------------------------------- io

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// ---------------------------------------------------------------- main

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const accessToken = await getAccessToken(args);

  if (args['list-sites']) {
    const sites = await listSites(accessToken);
    console.log('\nProperties accessible to this account:\n');
    for (const s of sites) console.log(`  ${s.url}  (${s.level})`);
    console.log('\nUse one with: npm run seo:gsc-pull -- --site "<property>"\n');
    return;
  }

  const site = await resolveSite(args, accessToken);
  const { startDate, endDate } = resolveRange(args);
  const dataState = args.fresh ? 'all' : 'final';
  console.log(`Pulling ${site}  ${startDate} -> ${endDate}  (dataState=${dataState})`);

  const base = { startDate, endDate, dataState };
  const pages = await queryAll(site, accessToken, { ...base, dimensions: ['page'] });
  console.log(`  pages:      ${pages.rows.length} rows`);
  const queries = await queryAll(site, accessToken, { ...base, dimensions: ['query'] });
  console.log(`  queries:    ${queries.rows.length} rows`);
  const queryPage = await queryAll(site, accessToken, { ...base, dimensions: ['query', 'page'] });
  console.log(`  query+page: ${queryPage.rows.length} rows`);
  const countries = await queryAll(site, accessToken, { ...base, dimensions: ['country'] });
  console.log(`  countries:  ${countries.rows.length} rows`);
  const countryPage = await queryAll(site, accessToken, {
    ...base,
    dimensions: ['country', 'page'],
  });
  console.log(`  country+page:  ${countryPage.rows.length} rows`);
  const countryQuery = await queryAll(site, accessToken, {
    ...base,
    dimensions: ['country', 'query'],
  });
  console.log(`  country+query: ${countryQuery.rows.length} rows`);

  const label = args.label || endDate;
  const outDir = path.join(REPO_ROOT, 'gsc-export', label);
  fs.mkdirSync(outDir, { recursive: true });

  // Match the existing manual-export shapes exactly.
  writeJson(path.join(outDir, 'gsc-pages-28d.json'), pages);
  writeJson(path.join(outDir, 'gsc-queries-28d.json'), queries);
  writeJson(path.join(outDir, 'gsc-query-page-28d.json'), queryPage.rows);
  writeJson(path.join(outDir, 'gsc-countries-28d.json'), countries);
  writeJson(path.join(outDir, 'gsc-country-page-28d.json'), countryPage);
  writeJson(path.join(outDir, 'gsc-country-query-28d.json'), countryQuery);
  writeJson(path.join(outDir, '_pull-meta.json'), {
    pulledAt: new Date().toISOString(),
    site,
    startDate,
    endDate,
    dataState,
    rowCounts: {
      pages: pages.rows.length,
      queries: queries.rows.length,
      queryPage: queryPage.rows.length,
      countries: countries.rows.length,
      countryPage: countryPage.rows.length,
      countryQuery: countryQuery.rows.length,
    },
  });

  const totalImpr = pages.rows.reduce((a, r) => a + (r.impressions || 0), 0);
  const totalClicks = pages.rows.reduce((a, r) => a + (r.clicks || 0), 0);
  console.log(`\nWrote ${path.relative(REPO_ROOT, outDir)}/`);
  console.log(`Totals: ${totalClicks} clicks / ${totalImpr} impressions across ${pages.rows.length} pages`);
  console.log(`\nNext: python scripts/gsc_analysis.py   (auto-uses the newest export folder)\n`);
}

main().catch((e) => fail(e.stack || String(e)));
