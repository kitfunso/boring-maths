#!/usr/bin/env node
/**
 * Generates `data/distances.ts` for the Avios Destination Finder: great-circle
 * distance (statute miles) from London Heathrow to every destination airport
 * in `data/destinations.ts`.
 *
 * Source: https://davidmegginson.github.io/ourairports-data/airports.csv
 * (OurAirports open dataset, public domain).
 *
 * Usage:
 *   node scripts/data/build-avios-distances.mjs            # downloads the CSV
 *   node scripts/data/build-avios-distances.mjs path.csv    # offline, local copy
 *
 * Distances are great-circle (haversine), not flown routes, so they are
 * rounded to the nearest 10 miles - false precision would be dishonest.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const SOURCE_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv';
const DESTINATIONS_FILE = join(
  ROOT,
  'src/components/calculators/AviosDestinationFinder/data/destinations.ts'
);
const OUTPUT_FILE = join(
  ROOT,
  'src/components/calculators/AviosDestinationFinder/data/distances.ts'
);

const EARTH_RADIUS_MILES = 3958.7613;
const ALLOWED_TYPES = new Set(['large_airport', 'medium_airport']);

/**
 * Minimal RFC4180 CSV parser - handles quoted fields with embedded commas
 * and doubled quotes ("" -> "). The OurAirports export has no embedded
 * newlines inside quoted fields, so normalising line endings first is safe.
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const normalised = text.replace(/\r\n/g, '\n');

  for (let i = 0; i < normalised.length; i++) {
    const c = normalised[i];
    if (inQuotes) {
      if (c === '"' && normalised[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1);
}

function rowsToRecords(rows) {
  const header = rows[0];
  const colIndex = Object.fromEntries(header.map((name, i) => [name, i]));
  const required = [
    'type',
    'latitude_deg',
    'longitude_deg',
    'scheduled_service',
    'icao_code',
    'iata_code',
  ];
  for (const col of required) {
    if (!(col in colIndex)) {
      console.error(`ERROR: expected CSV column "${col}" not found in header.`);
      process.exit(1);
    }
  }
  return rows.slice(1).map((r) => ({
    type: r[colIndex.type],
    latitude_deg: Number(r[colIndex.latitude_deg]),
    longitude_deg: Number(r[colIndex.longitude_deg]),
    scheduled_service: r[colIndex.scheduled_service],
    icao_code: r[colIndex.icao_code],
    iata_code: r[colIndex.iata_code],
  }));
}

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

function roundToNearest10(miles) {
  return Math.round(miles / 10) * 10;
}

/**
 * Resolve one CSV row per IATA code from the filtered candidate set.
 * Prefers large_airport over medium_airport when both are present; exits
 * with a listing if a code is still ambiguous after that tie-break.
 */
function resolveByIata(candidates) {
  const byIata = new Map();
  for (const row of candidates) {
    const list = byIata.get(row.iata_code) ?? [];
    list.push(row);
    byIata.set(row.iata_code, list);
  }

  const resolved = new Map();
  const conflicts = [];

  for (const [iata, group] of byIata) {
    if (group.length === 1) {
      resolved.set(iata, group[0]);
      continue;
    }
    const large = group.filter((r) => r.type === 'large_airport');
    if (large.length === 1) {
      resolved.set(iata, large[0]);
    } else {
      const ambiguous = large.length > 1 ? large : group;
      conflicts.push({ iata, rows: ambiguous });
    }
  }

  if (conflicts.length > 0) {
    console.error(`ERROR: ambiguous IATA code(s) after large-over-medium tie-break:`);
    for (const { iata, rows } of conflicts) {
      console.error(`  ${iata}: ${rows.map((r) => `${r.icao_code} (${r.type})`).join(' vs ')}`);
    }
    process.exit(1);
  }

  return resolved;
}

/**
 * Parse { city, iata } pairs from destinations.ts in file order.
 * The IATA-only regex is authoritative for coverage: a coupled city+iata
 * regex would silently drop a row if field order changed or a city name
 * contained an apostrophe. City names are a best-effort second pass used
 * only for display, falling back to the IATA code.
 */
function parseDestinationEntries(source) {
  const iatas = [...source.matchAll(/iata:\s*'([A-Z]{3})'/g)].map((m) => m[1]);
  const cityByIata = new Map();
  const pairRegex = /city:\s*'([^']*)',\s*\n\s*iata:\s*'([A-Z]{3})'/g;
  let m;
  while ((m = pairRegex.exec(source)) !== null) {
    cityByIata.set(m[2], m[1]);
  }
  return iatas.map((iata) => ({ city: cityByIata.get(iata) ?? iata, iata }));
}

async function loadCsvText(localPath) {
  if (localPath) {
    return readFileSync(localPath, 'utf-8');
  }
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    console.error(`ERROR: failed to download ${SOURCE_URL} (HTTP ${res.status})`);
    process.exit(1);
  }
  return await res.text();
}

function buildFileContent(entries, generatedDate) {
  const lines = entries
    .slice()
    .sort((a, b) => a.iata.localeCompare(b.iata))
    .map(({ iata, miles }) => `  ${iata}: ${miles},`)
    .join('\n');

  return `/**
 * Great-circle distances (statute miles) from London Heathrow (LHR) to every
 * Avios Destination Finder destination airport.
 *
 * Source: ${SOURCE_URL}
 * (OurAirports open dataset, public domain). Generated ${generatedDate} by:
 *   node scripts/data/build-avios-distances.mjs
 *
 * Distance = haversine great-circle from the CSV's own LHR row, rounded to
 * the nearest 10 miles. This is the "as the crow flies" distance, not the
 * flown route (which is typically longer) - the rounding is deliberate so
 * the figures do not imply more precision than the method supports.
 *
 * DO NOT hand-edit. Regenerate with the script above whenever
 * destinations.ts changes or the source dataset updates.
 */

export const DISTANCE_MILES_FROM_LONDON: Readonly<Record<string, number>> = {
${lines}
};

/**
 * Throws listing any destination missing a distance entry. Call this from
 * build-time code paths (e.g. astro page frontmatter) so a data-generation
 * gap fails \`astro build\`, not just the test suite. \`calculations.ts\`
 * keeps its own runtime throw as a backstop for the calculation layer.
 */
export function assertDistanceCoverage(
  destinations: readonly { iata: string; city: string }[]
): void {
  const missing = destinations.filter((d) => !(d.iata in DISTANCE_MILES_FROM_LONDON));
  if (missing.length > 0) {
    throw new Error(
      \`Missing DISTANCE_MILES_FROM_LONDON entries for: \${missing
        .map((d) => \`\${d.city} (\${d.iata})\`)
        .join(', ')}\`
    );
  }
}
`;
}

async function main() {
  const localPath = process.argv[2];
  const csvText = await loadCsvText(localPath);
  const rows = rowsToRecords(parseCsv(csvText));

  const candidates = rows.filter(
    (r) => r.iata_code !== '' && r.scheduled_service === 'yes' && ALLOWED_TYPES.has(r.type)
  );
  const resolved = resolveByIata(candidates);

  const lhr = resolved.get('LHR');
  if (!lhr) {
    console.error('ERROR: no LHR row found in the filtered CSV candidates.');
    process.exit(1);
  }

  const destSource = readFileSync(DESTINATIONS_FILE, 'utf-8');
  const destinationEntries = parseDestinationEntries(destSource);

  const missing = destinationEntries.filter((d) => !resolved.has(d.iata));
  if (missing.length > 0) {
    console.error('ERROR: missing IATA code(s) in the filtered CSV:');
    for (const d of missing) {
      console.error(`  ${d.city} (${d.iata})`);
    }
    process.exit(1);
  }

  const entries = destinationEntries.map(({ city, iata }) => {
    const airport = resolved.get(iata);
    const miles = roundToNearest10(
      haversineMiles(
        lhr.latitude_deg,
        lhr.longitude_deg,
        airport.latitude_deg,
        airport.longitude_deg
      )
    );
    return { city, iata, miles };
  });

  const generatedDate = new Date().toISOString().slice(0, 10);
  writeFileSync(OUTPUT_FILE, buildFileContent(entries, generatedDate), 'utf-8');

  const min = entries.reduce((a, b) => (b.miles < a.miles ? b : a));
  const max = entries.reduce((a, b) => (b.miles > a.miles ? b : a));

  console.log(`Distances written: ${entries.length} destinations -> ${OUTPUT_FILE}`);
  console.log(`Nearest: ${min.city} (${min.iata}) - ${min.miles} mi`);
  console.log(`Furthest: ${max.city} (${max.iata}) - ${max.miles} mi`);
  console.log(
    `LHR row used: icao=${lhr.icao_code} iata_code=${lhr.iata_code} lat=${lhr.latitude_deg} lon=${lhr.longitude_deg} type=${lhr.type} scheduled_service=${lhr.scheduled_service}`
  );
}

main();
