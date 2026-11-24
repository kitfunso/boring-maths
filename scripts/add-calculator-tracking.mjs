import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const calculatorsDir = join(__dirname, '..', 'src', 'components', 'calculators');

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

function extractCalculatorName(content, fileName) {
  const titleMatch = content.match(/title=["'`]([^"'`]+)["'`]/);
  if (titleMatch) {
    return titleMatch[1];
  }

  const baseName = fileName.replace(/\.tsx$/, '').replace(/Calculator$/, '');
  return baseName.replace(/([A-Z])/g, ' $1').trim();
}

function addTracking(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const fileName = filePath.split(/[/\\]/).pop();

  if (content.includes('useCalculatorTracking')) {
    console.log(`  ⏭️  ${fileName} - already has tracking`);
    return false;
  }

  if (!content.includes('export default function')) {
    console.log(`  ⏭️  ${fileName} - not a component`);
    return false;
  }

  const calculatorName = extractCalculatorName(content, fileName);

  const relativePath = filePath.replace(calculatorsDir, '').split(/[/\\]/).filter(Boolean);
  const depth = relativePath.length - 1;
  const importPrefix = '../'.repeat(depth + 2);
  const importStatement = `import { useCalculatorTracking } from '${importPrefix}hooks/useCalculatorTracking';`;

  const importBlockEnd = content.search(/\n(?:export|const |let |var |function |\/\*\*|\n\/\/[^\n]*\nexport)/);

  if (importBlockEnd === -1) {
    console.log(`  ⚠️  ${fileName} - couldn't find end of imports`);
    return false;
  }

  content = content.slice(0, importBlockEnd) + '\n' + importStatement + content.slice(importBlockEnd);

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
