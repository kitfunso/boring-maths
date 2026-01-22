/**
 * Add calculator tracking hook to all calculator components
 *
 * Run: node scripts/add-calculator-tracking.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const calculatorsDir = join(__dirname, '..', 'src', 'components', 'calculators');

// Get all calculator component files
function getCalculatorFiles(dir) {
  const files = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getCalculatorFiles(fullPath));
    } else if (
      item.endsWith('.tsx') &&
      !item.includes('types') &&
      !item.includes('calculations') &&
      !item.includes('.test.')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// Extract calculator name from the component
function extractCalculatorName(content, fileName) {
  // Try to find title prop in CalculatorHeader
  const titleMatch = content.match(/title=["'`]([^"'`]+)["'`]/);
  if (titleMatch) {
    return titleMatch[1];
  }

  // Fallback: derive from file name
  const baseName = fileName.replace(/\.tsx$/, '').replace(/Calculator$/, '');
  return baseName.replace(/([A-Z])/g, ' $1').trim();
}

// Add tracking to a calculator file
function addTracking(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const fileName = filePath.split(/[/\\]/).pop();

  // Skip if already has tracking
  if (content.includes('useCalculatorTracking')) {
    console.log(`  ⏭️  ${fileName} - already has tracking`);
    return false;
  }

  // Skip if it's not a component (no export default function)
  if (!content.includes('export default function')) {
    console.log(`  ⏭️  ${fileName} - not a component`);
    return false;
  }

  const calculatorName = extractCalculatorName(content, fileName);

  // Calculate the relative import path based on directory depth
  const relativePath = filePath.replace(calculatorsDir, '').split(/[/\\]/).filter(Boolean);
  const depth = relativePath.length - 1; // -1 for the file itself
  const importPrefix = '../'.repeat(depth + 2); // +2 to get to src/hooks

  // Add import statement - find the last complete import block
  const importStatement = `import { useCalculatorTracking } from '${importPrefix}hooks/useCalculatorTracking';`;

  // Find the position after all imports (handles multi-line imports)
  // Look for the first non-import code (export, const, function, etc.) after imports
  const importBlockEnd = content.search(/\n(?:export|const |let |var |function |\/\*\*|\n\/\/[^\n]*\nexport)/);

  if (importBlockEnd === -1) {
    console.log(`  ⚠️  ${fileName} - couldn't find end of imports`);
    return false;
  }

  // Insert the import before the first non-import statement
  content = content.slice(0, importBlockEnd) + '\n' + importStatement + content.slice(importBlockEnd);

  // Add hook call after the component function declaration
  // Look for patterns like "export default function ComponentName() {"
  // or "export default function ComponentName(): JSX.Element {"
  const componentMatch = content.match(/(export default function \w+\([^)]*\)[^{]*\{)/);
  if (!componentMatch) {
    console.log(`  ⚠️  ${fileName} - couldn't find component function`);
    return false;
  }

  const hookCall = `\n  // Track calculator usage for analytics\n  useCalculatorTracking('${calculatorName}');\n`;

  const componentStart = componentMatch.index + componentMatch[0].length;
  content = content.slice(0, componentStart) + hookCall + content.slice(componentStart);

  writeFileSync(filePath, content);
  console.log(`  ✓ ${fileName} - added tracking for "${calculatorName}"`);
  return true;
}

// Main
async function main() {
  console.log('Adding calculator tracking to all components...\n');

  const files = getCalculatorFiles(calculatorsDir);
  console.log(`Found ${files.length} calculator files\n`);

  let added = 0;
  let skipped = 0;

  for (const file of files) {
    if (addTracking(file)) {
      added++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone! Added tracking to ${added} files, skipped ${skipped} files`);
}

main().catch(console.error);
