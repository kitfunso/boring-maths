import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const typesSource = readFileSync(
  join(ROOT, 'src/lib/sharedData/types.ts'),
  'utf-8'
);

function parseSharedDataFields(source) {
  const interfaceMatch = source.match(
    /export\s+interface\s+SharedCalculatorData\s*\{([\s\S]*?)\n\}/
  );
  if (!interfaceMatch) {
    console.error('ERROR: Could not parse SharedCalculatorData interface from types.ts');
    process.exit(1);
  }

  const body = interfaceMatch[1];
  const fields = new Set();

  for (const line of body.split('\n')) {
    const fieldMatch = line.match(/^\s+(\w+)\??:/);
    if (fieldMatch) {
      fields.add(fieldMatch[1]);
    }
  }

  return fields;
}

const VALID_FIELDS = parseSharedDataFields(typesSource);

const configSource = readFileSync(
  join(ROOT, 'src/lib/sharedData/calculatorConfigs.ts'),
  'utf-8'
);

function parseCalculatorConfigs(source) {
  const configs = [];

  const entryRegex =
    /'([^']+)':\s*\{([^}]+)\}/g;

  let match;
  while ((match = entryRegex.exec(source)) !== null) {
    const key = match[1];
    const block = match[2];
    const line = source.substring(0, match.index).split('\n').length;

    const idMatch = block.match(/id:\s*'([^']+)'/);
    const id = idMatch ? idMatch[1] : null;

    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const name = nameMatch ? nameMatch[1] : null;

    const importsMatch = block.match(/imports:\s*\[([\s\S]*?)\]/);
    const imports = importsMatch
      ? [...importsMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
      : [];

    const exportsMatch = block.match(/exports:\s*\[([\s\S]*?)\]/);
    const exports = exportsMatch
      ? [...exportsMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
      : [];

    configs.push({ key, id, name, imports, exports, line });
  }

  return configs;
}

const configs = parseCalculatorConfigs(configSource);

if (configs.length === 0) {
  console.error('ERROR: Could not parse any entries from CALCULATOR_CONFIGS');
  process.exit(1);
}

function collectCalculatorSlugs(dir) {
  const slugs = new Set();

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      for (const sub of readdirSync(full)) {
        if (sub.endsWith('.astro')) {
          slugs.add(sub.replace('.astro', ''));
        }
      }
    } else if (entry.endsWith('.astro') && entry !== 'index.astro') {
      slugs.add(entry.replace('.astro', ''));
    }
  }

  return slugs;
}

const pageSlugs = collectCalculatorSlugs(join(ROOT, 'src/pages/calculators'));

const errors = [];
const warnings = [];

for (const cfg of configs) {
  const loc = `calculatorConfigs.ts:${cfg.line}`;

  if (cfg.id !== cfg.key) {
    errors.push(
      `[${loc}] Key "${cfg.key}" does not match id "${cfg.id}"`
    );
  }

  const possibleSlugs = [
    `${cfg.key}-calculator`,
    cfg.key,
  ];
  const hasPage = possibleSlugs.some((slug) => pageSlugs.has(slug));

  if (!hasPage) {
    errors.push(
      `[${loc}] Config "${cfg.key}" has no matching page. ` +
      `Looked for: ${possibleSlugs.map((s) => s + '.astro').join(', ')}`
    );
  }

  for (const field of cfg.imports) {
    if (!VALID_FIELDS.has(field)) {
      errors.push(
        `[${loc}] Config "${cfg.key}" imports unknown field "${field}". ` +
        `Valid fields: ${[...VALID_FIELDS].join(', ')}`
      );
    }
  }

  for (const field of cfg.exports) {
    if (!VALID_FIELDS.has(field)) {
      errors.push(
        `[${loc}] Config "${cfg.key}" exports unknown field "${field}". ` +
        `Valid fields: ${[...VALID_FIELDS].join(', ')}`
      );
    }
  }

  const overlap = cfg.imports.filter((f) => cfg.exports.includes(f));
  if (overlap.length > 0) {
    warnings.push(
      `[${loc}] Config "${cfg.key}" both imports and exports: ${overlap.join(', ')}`
    );
  }

  if (cfg.imports.length === 0 && cfg.exports.length === 0) {
    warnings.push(
      `[${loc}] Config "${cfg.key}" has no imports or exports — consider removing it`
    );
  }
}

for (const cfg of configs) {
  const loc = `calculatorConfigs.ts:${cfg.line}`;

  const importDupes = cfg.imports.filter(
    (f, i) => cfg.imports.indexOf(f) !== i
  );
  if (importDupes.length > 0) {
    warnings.push(
      `[${loc}] Config "${cfg.key}" has duplicate imports: ${importDupes.join(', ')}`
    );
  }

  const exportDupes = cfg.exports.filter(
    (f, i) => cfg.exports.indexOf(f) !== i
  );
  if (exportDupes.length > 0) {
    warnings.push(
      `[${loc}] Config "${cfg.key}" has duplicate exports: ${exportDupes.join(', ')}`
    );
  }
}

console.log(
  `\nShared Data Validation: ${configs.length} configs, ${pageSlugs.size} calculator pages, ${VALID_FIELDS.size} valid fields\n`
);

if (warnings.length > 0) {
  console.log(`WARNINGS (${warnings.length}):`);
  for (const w of warnings) {
    console.log(`  ⚠  ${w}`);
  }
  console.log('');
}

if (errors.length > 0) {
  console.log(`ERRORS (${errors.length}):`);
  for (const e of errors) {
    console.log(`  ✗  ${e}`);
  }
  console.log('\nShared data validation FAILED.\n');
  process.exit(1);
} else {
  console.log('Shared data validation passed.\n');
}
