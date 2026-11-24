#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HASHES_FILE = join(__dirname, 'avios-source-hashes.json');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const FETCH_TIMEOUT_MS = 15000;

const SOURCES = [
  {
    url: 'https://www.headforpoints.com/2025/12/16/how-many-avios-do-i-need-to-fly-to-4/',
    label: 'HfP pricing article (data/destinations.ts header)',
    fingerprint: fingerprintTableNumbers,
  },
  {
    url: 'https://awardwallet.com/airlines/avios-peak-calendar/',
    label: 'AwardWallet peak calendar (data/peakCalendar.ts header)',
    fingerprint: fingerprintDatesAndPrices,
  },
];

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function fingerprintTableNumbers(html) {
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  if (tables.length === 0) {
    return null;
  }
  const text = stripTags(tables.join(' '));
  const tokens = text.match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
  const cleaned = tokens.map((t) => t.replace(/,/g, ''));
  return [...new Set(cleaned)].sort();
}

const MONTH_NAMES =
  'January|February|March|April|May|June|July|August|September|October|November|December';

function fingerprintDatesAndPrices(html) {
  const scoped = html.match(/<main[\s\S]*?<\/main>/i) ?? html.match(/<article[\s\S]*?<\/article>/i);
  const text = stripTags(scoped ? scoped[0] : html);

  const monthRegex = new RegExp(
    `\\b(${MONTH_NAMES}):\\s*((?:\\d[\\d,\\-\\s]*)|no peak dates this month)`,
    'g'
  );
  const tokens = [];
  let match;
  while ((match = monthRegex.exec(text)) !== null) {
    const days = match[2]
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\s*-\s*/g, '-')
      .replace(/\s*,\s*/g, ',');
    tokens.push(`${match[1]}:${days}`.toLowerCase());
  }
  const unique = [...new Set(tokens)].sort();
  return unique.length > 0 ? unique : null;
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
      signal: controller.signal,
    });
    if (!res.ok) {
      return { ok: false, reason: `HTTP ${res.status}` };
    }
    return { ok: true, html: await res.text() };
  } catch (err) {
    return { ok: false, reason: err.message };
  } finally {
    clearTimeout(timer);
  }
}

function loadBaseline() {
  if (!existsSync(HASHES_FILE)) {
    return [];
  }
  const raw = readFileSync(HASHES_FILE, 'utf-8').trim();
  if (raw === '') {
    return [];
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`ERROR: ${HASHES_FILE} is not valid JSON: ${err.message}`);
    process.exit(1);
  }
  if (!Array.isArray(parsed)) {
    console.error(`ERROR: ${HASHES_FILE} must contain a JSON array of entries.`);
    process.exit(1);
  }
  return parsed;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function checkSource(source, baselineByUrl, forceUpdate) {
  const prior = baselineByUrl.get(source.url);
  const fetched = await fetchHtml(source.url);

  if (!fetched.ok) {
    console.log(`SKIPPED (unreachable): ${source.label}`);
    console.log(`  url: ${source.url}`);
    console.log(`  reason: ${fetched.reason}`);
    return {
      entry: prior ?? { url: source.url, status: 'skipped', reason: fetched.reason },
      drift: false,
    };
  }

  const tokens = source.fingerprint(fetched.html);
  if (tokens === null) {
    console.log(`SKIPPED (page shape changed - no matching content found): ${source.label}`);
    console.log(`  url: ${source.url}`);
    return {
      entry: prior ?? { url: source.url, status: 'skipped', reason: 'page shape changed' },
      drift: false,
    };
  }

  const hash = sha256(tokens.join('|'));
  const entry = {
    url: source.url,
    sha256: hash,
    capturedAt: today(),
    status: 'ok',
    tokenCount: tokens.length,
  };

  if (forceUpdate || !prior || prior.status !== 'ok') {
    console.log(`${forceUpdate ? 'UPDATED' : 'SEEDED'}: ${source.label}`);
    console.log(`  url: ${source.url}`);
    console.log(`  sha256: ${hash}`);
    console.log(`  tokens: ${tokens.length}`);
    return { entry, drift: false };
  }

  if (prior.sha256 === hash) {
    console.log(`OK (unchanged): ${source.label}`);
    console.log(`  url: ${source.url}`);
    console.log(`  sha256: ${hash}`);
    return { entry: prior, drift: false };
  }

  console.log(`DRIFT DETECTED: ${source.label}`);
  console.log(`  url: ${source.url}`);
  console.log(`  was: ${prior.sha256} (captured ${prior.capturedAt})`);
  console.log(`  now: ${hash}`);
  return { entry: { ...entry, status: 'drift' }, drift: true };
}

async function main() {
  const forceUpdate = process.argv.includes('--update');
  const baseline = loadBaseline();
  const baselineByUrl = new Map(baseline.map((e) => [e.url, e]));

  const results = [];
  let driftDetected = false;

  for (const source of SOURCES) {
    const { entry, drift } = await checkSource(source, baselineByUrl, forceUpdate);
    results.push(entry);
    driftDetected = driftDetected || drift;
    console.log('');
  }

  if (forceUpdate) {
    const sorted = results.slice().sort((a, b) => a.url.localeCompare(b.url));
    writeFileSync(HASHES_FILE, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
  }

  if (driftDetected) {
    console.log(
      'One or more sources changed since the last capture. This is drift DETECTION only, ' +
        'not proof the finder is wrong - BA guide prices and the peak calendar typically ' +
        'change about once a year. Re-verify manually against the checklist in ' +
        'src/components/calculators/AviosDestinationFinder/data/peakCalendar.ts, update the ' +
        'data files if needed, then rerun with --update to reset the baseline.'
    );
    process.exit(1);
  }

  console.log('No drift detected.');
  process.exit(0);
}

main();
