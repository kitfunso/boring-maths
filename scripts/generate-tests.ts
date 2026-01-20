/**
 * Generate test files for all calculators
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CALCULATORS_DIR = path.join(__dirname, '../src/components/calculators');
const TESTS_DIR = path.join(__dirname, '../tests/calculations');

// Calculators to skip
const SKIP_DIRS = ['shared'];
const EXISTING_TESTS = ['compound-interest', 'loan-calculator', 'tip-calculator'];

interface CalculatorInfo {
  name: string;
  dir: string;
  hasTypes: boolean;
  hasDefaultInputs: boolean;
  calculateFunctionName: string;
  inputTypeName: string;
  resultTypeName: string;
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

function toKebabCase(str: string): string {
  // Handle cases like 401kCalculator, ABVCalculator, etc.
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
    .replace(/^calculator-/, '')
    .replace(/-calculator$/, '');
}

function analyzeCalculator(dirName: string): CalculatorInfo | null {
  const calculatorPath = path.join(CALCULATORS_DIR, dirName);
  const calculationsPath = path.join(calculatorPath, 'calculations.ts');
  const typesPath = path.join(calculatorPath, 'types.ts');

  if (!fs.existsSync(calculationsPath)) {
    return null;
  }

  const hasTypes = fs.existsSync(typesPath);

  // Read calculations.ts to find the main calculation function
  const calculationsContent = fs.readFileSync(calculationsPath, 'utf-8');

  // Try to find the main calculate function
  const functionMatch = calculationsContent.match(/export function (calculate\w+)/);
  const calculateFunctionName = functionMatch ? functionMatch[1] : 'calculate';

  // Read types.ts if it exists to find type names
  let inputTypeName = 'Inputs';
  let resultTypeName = 'Result';
  let hasDefaultInputs = false;

  if (hasTypes) {
    const typesContent = fs.readFileSync(typesPath, 'utf-8');

    // Find input type
    const inputTypeMatch = typesContent.match(/export interface (\w+Inputs)/);
    if (inputTypeMatch) {
      inputTypeName = inputTypeMatch[1];
    }

    // Find result type
    const resultTypeMatch = typesContent.match(/export interface (\w+Result)/);
    if (resultTypeMatch) {
      resultTypeName = resultTypeMatch[1];
    }

    // Check for getDefaultInputs
    hasDefaultInputs = typesContent.includes('getDefaultInputs');
  }

  return {
    name: dirName,
    dir: dirName,
    hasTypes,
    hasDefaultInputs,
    calculateFunctionName,
    inputTypeName,
    resultTypeName,
  };
}

function generateTestContent(info: CalculatorInfo): string {
  const kebabName = toKebabCase(info.name);
  const pascalName = toPascalCase(kebabName);

  const imports = [];
  imports.push(`import { describe, it, expect } from 'vitest';`);
  imports.push(`import { ${info.calculateFunctionName} } from '../../src/components/calculators/${info.name}/calculations';`);

  if (info.hasTypes) {
    if (info.hasDefaultInputs) {
      imports.push(`import { getDefaultInputs } from '../../src/components/calculators/${info.name}/types';`);
    }
    imports.push(`import type { ${info.inputTypeName} } from '../../src/components/calculators/${info.name}/types';`);
  }

  return `/**
 * ${pascalName} Calculator - Unit Tests
 */

${imports.join('\n')}

describe('${pascalName}Calculator', () => {
  describe('${info.calculateFunctionName}', () => {
    it('should calculate with default inputs', () => {
      ${info.hasDefaultInputs ? `const inputs = getDefaultInputs();` : `// TODO: Create test inputs
      const inputs: ${info.inputTypeName} = {} as ${info.inputTypeName};`}

      const result = ${info.calculateFunctionName}(inputs);

      expect(result).toBeDefined();
      // TODO: Add specific assertions for result properties
    });

    it('should handle edge case: zero values', () => {
      ${info.hasDefaultInputs ? `const inputs = getDefaultInputs();` : `const inputs: ${info.inputTypeName} = {} as ${info.inputTypeName};`}
      // TODO: Set specific fields to 0 and test behavior

      const result = ${info.calculateFunctionName}(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      ${info.hasDefaultInputs ? `const inputs = getDefaultInputs();` : `const inputs: ${info.inputTypeName} = {} as ${info.inputTypeName};`}
      // TODO: Set large values and verify calculations

      const result = ${info.calculateFunctionName}(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      ${info.hasDefaultInputs ? `const inputs = getDefaultInputs();` : `const inputs: ${info.inputTypeName} = {} as ${info.inputTypeName};`}

      const result1 = ${info.calculateFunctionName}(inputs);
      const result2 = ${info.calculateFunctionName}(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
`;
}

function main() {
  // Ensure tests directory exists
  if (!fs.existsSync(TESTS_DIR)) {
    fs.mkdirSync(TESTS_DIR, { recursive: true });
  }

  // Get all calculator directories
  const dirs = fs.readdirSync(CALCULATORS_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !SKIP_DIRS.includes(name));

  console.log(`Found ${dirs.length} calculator directories`);

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const dir of dirs) {
    try {
      const kebabName = toKebabCase(dir);
      const testFileName = `${kebabName}.test.ts`;
      const testFilePath = path.join(TESTS_DIR, testFileName);

      // Skip if test already exists
      if (EXISTING_TESTS.includes(kebabName) || fs.existsSync(testFilePath)) {
        console.log(`⏭️  Skipping ${kebabName} (test already exists)`);
        skipped++;
        continue;
      }

      const info = analyzeCalculator(dir);

      if (!info) {
        console.log(`⚠️  Skipping ${dir} (no calculations.ts found)`);
        skipped++;
        continue;
      }

      const testContent = generateTestContent(info);
      fs.writeFileSync(testFilePath, testContent);

      console.log(`✅ Generated ${testFileName}`);
      generated++;
    } catch (error) {
      console.error(`❌ Error processing ${dir}:`, error);
      errors++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  Generated: ${generated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total: ${generated + skipped + errors}`);
}

main();
