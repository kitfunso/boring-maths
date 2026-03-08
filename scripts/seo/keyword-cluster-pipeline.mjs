#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { enrichKeywords, summariseClusters } from './keyword-cluster-core.mjs';

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
  if (/[",\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
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

function defaultOutputPaths(inputPath) {
  const ext = path.extname(inputPath);
  const base = inputPath.slice(0, -ext.length);
  return {
    output: `${base}.clustered.csv`,
    summary: `${base}.clusters.csv`,
  };
}

function printUsage() {
  console.log(
    'Usage: node scripts/seo/keyword-cluster-pipeline.mjs --input <keywords.csv> [--output <clustered.csv>] [--summary <clusters.csv>]',
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.input || args.help) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  const inputPath = path.resolve(args.input);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const { output: defaultOutput, summary: defaultSummary } = defaultOutputPaths(inputPath);
  const outputPath = path.resolve(args.output ?? defaultOutput);
  const summaryPath = path.resolve(args.summary ?? defaultSummary);

  const csvContent = fs.readFileSync(inputPath, 'utf8');
  const rows = parseCsv(csvContent);

  if (rows.length === 0) {
    console.error('Input file has no keyword rows.');
    process.exit(1);
  }

  const enriched = enrichKeywords(rows);
  const summary = summariseClusters(enriched);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });

  fs.writeFileSync(outputPath, toCsv(enriched), 'utf8');
  fs.writeFileSync(summaryPath, toCsv(summary), 'utf8');

  console.log(`Processed ${enriched.length} keywords.`);
  console.log(`Enriched output: ${outputPath}`);
  console.log(`Cluster summary: ${summaryPath}`);
}

main();
