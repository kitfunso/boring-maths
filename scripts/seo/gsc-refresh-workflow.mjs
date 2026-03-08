#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  buildRefreshOpportunities,
  summariseRefreshOpportunities,
  toUrlPath,
} from './gsc-refresh-core.mjs';

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

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current);
  return result.map((value) => value.trim());
}

function parseCsv(content) {
  const lines = content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return row;
  });
}

function csvEscape(value) {
  const raw = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

function toCsv(rows) {
  if (rows.length === 0) return '';

  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [headers.join(',')];

  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(','));
  }

  return `${lines.join('\n')}\n`;
}

function usage() {
  console.log(
    'Usage: node scripts/seo/gsc-refresh-workflow.mjs --input <gsc-pages-queries.csv> [--output <opportunities.csv>] [--summary <pages.csv>] [--repoRoot <path>]',
  );
}

function defaultOutputPaths(inputPath) {
  const ext = path.extname(inputPath);
  const base = inputPath.slice(0, -ext.length);
  return {
    output: `${base}.refresh-opportunities.csv`,
    summary: `${base}.refresh-pages.csv`,
  };
}

function resolvePageCandidates(urlPath) {
  const pathOnly = toUrlPath(urlPath).replace(/\/+$/, '') || '/';

  if (pathOnly === '/') {
    return ['src/pages/index.astro'];
  }

  const relativePath = pathOnly.replace(/^\//, '');

  return [
    `src/pages/${relativePath}.astro`,
    `src/pages/${relativePath}/index.astro`,
  ];
}

function resolvePageSourceMap(rows, repoRoot) {
  const map = {};
  const pageUrls = [...new Set(rows.map((row) => toUrlPath(row.page ?? row.Page ?? row.url ?? row.URL ?? '/')))].filter(
    Boolean,
  );

  for (const pageUrl of pageUrls) {
    const candidates = resolvePageCandidates(pageUrl).map((relativePath) => ({
      relativePath,
      absolutePath: path.join(repoRoot, relativePath),
    }));

    const hit = candidates.find((candidate) => fs.existsSync(candidate.absolutePath));

    if (hit) {
      map[pageUrl] = {
        source_file: hit.relativePath,
        source_text: fs.readFileSync(hit.absolutePath, 'utf8'),
      };
    } else {
      map[pageUrl] = {
        source_file: '',
        source_text: '',
      };
    }
  }

  return map;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.input || args.help) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  const inputPath = path.resolve(args.input);
  const repoRoot = path.resolve(args.repoRoot ?? process.cwd());

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const { output: defaultOutput, summary: defaultSummary } = defaultOutputPaths(inputPath);
  const outputPath = path.resolve(args.output ?? defaultOutput);
  const summaryPath = path.resolve(args.summary ?? defaultSummary);

  const rows = parseCsv(fs.readFileSync(inputPath, 'utf8'));

  if (rows.length === 0) {
    console.error('Input file has no rows.');
    process.exit(1);
  }

  const pageSource = resolvePageSourceMap(rows, repoRoot);
  const pageTextByUrlPath = Object.fromEntries(
    Object.entries(pageSource).map(([urlPath, item]) => [urlPath, item.source_text]),
  );

  const opportunities = buildRefreshOpportunities(rows, pageTextByUrlPath, {
    minImpressions: Number(args.minImpressions ?? 50),
    minPosition: Number(args.minPosition ?? 3),
    maxPosition: Number(args.maxPosition ?? 40),
    maxCoverage: Number(args.maxCoverage ?? 0.8),
  }).map((row) => ({
    ...row,
    source_file: pageSource[row.page_url]?.source_file ?? '',
  }));

  const summary = summariseRefreshOpportunities(opportunities);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });

  fs.writeFileSync(outputPath, toCsv(opportunities), 'utf8');
  fs.writeFileSync(summaryPath, toCsv(summary), 'utf8');

  const missingSourcePages = Object.entries(pageSource)
    .filter(([, item]) => !item.source_file)
    .map(([page]) => page);

  console.log(`Processed ${rows.length} GSC rows.`);
  console.log(`Opportunities: ${opportunities.length}`);
  console.log(`Opportunity output: ${outputPath}`);
  console.log(`Page summary output: ${summaryPath}`);

  if (missingSourcePages.length > 0) {
    console.log(`Pages with no source mapping (${missingSourcePages.length}):`);
    for (const page of missingSourcePages) console.log(`- ${page}`);
  }
}

main();
