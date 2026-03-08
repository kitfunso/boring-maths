#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { buildInternalLinkMap, summariseInternalLinkMap } from './internal-link-core.mjs';

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

function extractFirstMatch(content, regex) {
  const match = content.match(regex);
  return match?.[1]?.trim() ?? '';
}

function pathToUrl(relativePagePath) {
  const normalized = relativePagePath.replace(/\\/g, '/');
  const withoutPrefix = normalized.replace(/^src\/pages/, '');
  const noExt = withoutPrefix.replace(/\.astro$/, '');

  if (noExt === '/index') return '/';
  if (noExt.endsWith('/index')) return noExt.slice(0, -6);
  return noExt;
}

function walkAstroFiles(rootDir) {
  const results = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.astro')) {
        results.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return results;
}

function extractPages(repoRoot) {
  const calculatorsDir = path.join(repoRoot, 'src', 'pages', 'calculators');
  const files = walkAstroFiles(calculatorsDir);

  return files
    .map((absolutePath) => {
      const relativePath = path.relative(repoRoot, absolutePath);
      const content = fs.readFileSync(absolutePath, 'utf8');

      const canonicalURL = extractFirstMatch(content, /const\s+canonicalURL\s*=\s*['"`]([^'"`]+)['"`]/);
      const title = extractFirstMatch(content, /const\s+title\s*=\s*['"`]([^'"`]+)['"`]/);
      const keywords = extractFirstMatch(content, /const\s+keywords\s*=\s*['"`]([^'"`]+)['"`]/);

      const url = canonicalURL || pathToUrl(relativePath);
      const slug = url.replace(/^\/calculators\//, '').replace(/^\//, '');

      return {
        slug,
        url,
        title,
        keywords,
        source_file: relativePath.replace(/\\/g, '/'),
      };
    })
    .filter((page) => page.url.startsWith('/calculators/'));
}

function usage() {
  console.log(
    'Usage: node scripts/seo/internal-link-map.mjs [--repoRoot <path>] [--output <map.csv>] [--summary <summary.csv>] [--maxLinksPerPage <n>] [--minSimilarity <n>]',
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }

  const repoRoot = path.resolve(args.repoRoot ?? process.cwd());
  const outputPath = path.resolve(
    args.output ?? path.join(repoRoot, 'scripts', 'seo', 'output', 'internal-link-map.csv'),
  );
  const summaryPath = path.resolve(
    args.summary ?? path.join(repoRoot, 'scripts', 'seo', 'output', 'internal-link-summary.csv'),
  );

  const pages = extractPages(repoRoot);
  const rows = buildInternalLinkMap(pages, {
    maxLinksPerPage: Number(args.maxLinksPerPage ?? 4),
    minSimilarity: Number(args.minSimilarity ?? 0.15),
  }).map((row) => ({
    ...row,
    source_file: pages.find((page) => page.url === row.source_url)?.source_file ?? '',
    target_file: pages.find((page) => page.url === row.target_url)?.source_file ?? '',
  }));

  const summary = summariseInternalLinkMap(rows);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });

  fs.writeFileSync(outputPath, toCsv(rows), 'utf8');
  fs.writeFileSync(summaryPath, toCsv(summary), 'utf8');

  console.log(`Scanned pages: ${pages.length}`);
  console.log(`Suggested internal links: ${rows.length}`);
  console.log(`Link map output: ${outputPath}`);
  console.log(`Summary output: ${summaryPath}`);
}

main();
