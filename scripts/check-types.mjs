// CI had no type check, so 16 Select handlers that read e.target off a string shipped broken.
// Ratchet: fail when any file|code error count grows past scripts/type-baseline.json.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(ROOT, 'scripts', 'type-baseline.json');
const require = createRequire(import.meta.url);

const HINTS = {
  TS2339: 'Property missing on this type; a Select onChange gets the option value, not an event.',
  TS2345: 'Argument type does not match the parameter; narrow or cast it at the call site.',
  TS2322: 'Assigned type does not match; fix the value or the prop type.',
  TS2307: 'Module not found; fix the import path or run `npx astro sync`.',
  TS7006: 'Parameter has an implicit any; annotate it.',
};
const DEFAULT_HINT =
  'Fix the new error, or run `npm run typecheck -- --update` and justify it in the PR.';

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1 << 28,
  });
}

function ensureAstroTypes() {
  if (existsSync(join(ROOT, '.astro', 'types.d.ts'))) return;
  const astro = join(dirname(require.resolve('astro/package.json')), 'astro.js');
  const sync = run(astro, ['sync']);
  if (sync.status !== 0) {
    console.error(
      `astro sync failed (exit ${sync.status}), cannot type check.\n${sync.stdout}${sync.stderr}`
    );
    process.exit(2);
  }
}

function collectErrors() {
  const tsc = require.resolve('typescript/bin/tsc');
  const res = run(tsc, [
    '--noEmit',
    '-p',
    'tsconfig.json',
    '--pretty',
    'false',
  ]);
  if (res.error) {
    console.error(`could not start tsc: ${res.error.message}`);
    process.exit(2);
  }
  const counts = {};
  const first = {};
  for (const line of `${res.stdout}\n${res.stderr}`.split(/\r?\n/)) {
    const m = /^(?:(.+?)\((\d+),(\d+)\): )?error (TS\d+): (.*)$/.exec(line);
    if (!m) continue;
    const file = m[1] ? m[1].replace(/\\/g, '/').replace(/^\.\//, '') : '<global>';
    const key = `${file}|${m[4]}`;
    counts[key] = (counts[key] ?? 0) + 1;
    first[key] ??= m[1] ? `${m[2]},${m[3]}: ${m[5]}` : m[5];
  }
  if (res.status !== 0 && Object.keys(counts).length === 0) {
    console.error(`tsc failed (exit ${res.status}) without TS errors:\n${res.stdout}${res.stderr}`);
    process.exit(2);
  }
  return { counts, first };
}

function sortedObject(obj) {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

ensureAstroTypes();
const { counts, first } = collectErrors();
const total = Object.values(counts).reduce((a, b) => a + b, 0);

if (process.argv.includes('--update')) {
  writeFileSync(BASELINE, `${JSON.stringify(sortedObject(counts), null, 2)}\n`);
  console.log(
    `baseline updated: ${total} errors in ${Object.keys(counts).length} file|code entries`
  );
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error('scripts/type-baseline.json is missing; run `npm run typecheck -- --update`.');
  process.exit(2);
}
const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));

const regressions = Object.keys(counts)
  .filter((key) => counts[key] > (baseline[key] ?? 0))
  .sort();
const improved = Object.keys(baseline).filter((key) => (counts[key] ?? 0) < baseline[key]);

if (regressions.length > 0) {
  for (const key of regressions) {
    const [file, code] = key.split('|');
    console.error(`REGRESSION ${file} ${code}: ${baseline[key] ?? 0} -> ${counts[key]}`);
    console.error(`  first: ${first[key]}`);
    console.error(`  fix: ${HINTS[code] ?? DEFAULT_HINT}`);
  }
  console.error(
    `typecheck FAILED: ${regressions.length} file|code entries above baseline (${total} errors total)`
  );
  process.exit(1);
}

console.log(`typecheck OK: ${total} errors, none above baseline`);
if (improved.length > 0) {
  console.log(
    `${improved.length} entries fell below baseline; run \`npm run typecheck -- --update\` to lock it in.`
  );
}
