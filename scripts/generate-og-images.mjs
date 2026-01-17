/**
 * Generate OG Images for all calculators
 *
 * Uses satori to render JSX to SVG, then resvg to convert to PNG
 * Run: node scripts/generate-og-images.mjs
 */

import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Calculator definitions
const calculators = [
  // Original calculators
  { id: 'tip-calculator', name: 'Tip Calculator', emoji: '💵', color: '#22c55e', tagline: 'Split bills & calculate tips' },
  { id: 'freelance-day-rate-calculator', name: 'Freelance Day Rate', emoji: '💼', color: '#3b82f6', tagline: 'Calculate your ideal day rate' },
  { id: 'savings-goal-calculator', name: 'Savings Goal', emoji: '🎯', color: '#eab308', tagline: 'Plan your savings journey' },
  { id: 'emergency-fund-calculator', name: 'Emergency Fund', emoji: '🛡️', color: '#3b82f6', tagline: 'Build your safety net' },
  { id: 'compound-interest-calculator', name: 'Compound Interest', emoji: '📈', color: '#eab308', tagline: 'Watch your money grow' },
  { id: 'mortgage-calculator', name: 'Mortgage Calculator', emoji: '🏠', color: '#22c55e', tagline: 'Estimate monthly payments' },
  { id: 'hourly-to-salary-calculator', name: 'Hourly to Salary', emoji: '⏰', color: '#22c55e', tagline: 'Convert hourly to annual' },
  { id: 'raise-calculator', name: 'Raise Calculator', emoji: '📊', color: '#22c55e', tagline: 'See the value of your raise' },
  { id: 'side-hustle-profitability-calculator', name: 'Side Hustle', emoji: '🚀', color: '#ef4444', tagline: 'Is your side gig profitable?' },
  { id: 'break-even-calculator', name: 'Break-Even', emoji: '⚖️', color: '#3b82f6', tagline: 'Find your break-even point' },
  { id: 'bmi-calculator', name: 'BMI Calculator', emoji: '🏃', color: '#a855f7', tagline: 'Calculate body mass index' },
  { id: 'age-calculator', name: 'Age Calculator', emoji: '🎂', color: '#a855f7', tagline: 'Calculate your exact age' },
  { id: 'unit-converter', name: 'Unit Converter', emoji: '📐', color: '#3b82f6', tagline: 'Convert any measurement' },
  { id: 'wedding-alcohol-calculator', name: 'Wedding Alcohol', emoji: '🥂', color: '#a855f7', tagline: 'Plan drinks for your wedding' },
  { id: 'bbq-calculator', name: 'BBQ Calculator', emoji: '🍖', color: '#ef4444', tagline: 'Plan meat for your cookout' },
  { id: 'paint-calculator', name: 'Paint Calculator', emoji: '🎨', color: '#a855f7', tagline: 'Calculate paint needed' },
  { id: 'electricity-cost-calculator', name: 'Electricity Cost', emoji: '⚡', color: '#eab308', tagline: 'Calculate appliance costs' },
  { id: 'percentage-calculator', name: 'Percentage Calculator', emoji: '➗', color: '#a855f7', tagline: 'What is X% of Y?' },
  { id: 'debt-payoff-calculator', name: 'Debt Payoff', emoji: '💳', color: '#3b82f6', tagline: 'Snowball vs Avalanche' },
  { id: 'calorie-calculator', name: 'Calorie Calculator', emoji: '🔥', color: '#22c55e', tagline: 'TDEE & Daily Calories' },
  { id: 'loan-calculator', name: 'Loan Calculator', emoji: '🏦', color: '#3b82f6', tagline: 'Monthly Payment & Interest' },
  { id: 'discount-calculator', name: 'Discount Calculator', emoji: '🏷️', color: '#ef4444', tagline: 'Sale Price & Savings' },
  { id: 'dog-age-calculator', name: 'Dog Age Calculator', emoji: '🐕', color: '#f59e0b', tagline: 'Dog Years to Human Years' },
  // Additional calculators
  { id: '401k-calculator', name: '401(k) Calculator', emoji: '💰', color: '#22c55e', tagline: 'Plan your retirement savings' },
  { id: 'contractor-vs-employee-calculator', name: 'Contractor vs Employee', emoji: '🤝', color: '#3b82f6', tagline: 'Compare total compensation' },
  { id: 'etsy-fee-calculator', name: 'Etsy Fee Calculator', emoji: '🛍️', color: '#f97316', tagline: 'Calculate seller fees' },
  { id: 'fire-calculator', name: 'FIRE Calculator', emoji: '🔥', color: '#f59e0b', tagline: 'Financial independence' },
  { id: 'flooring-calculator', name: 'Flooring Calculator', emoji: '🪵', color: '#92400e', tagline: 'Calculate flooring needed' },
  { id: 'go-full-time-calculator', name: 'Go Full-Time', emoji: '🎯', color: '#22c55e', tagline: 'When to quit your job' },
  { id: 'gpa-calculator', name: 'GPA Calculator', emoji: '🎓', color: '#3b82f6', tagline: 'Calculate your GPA' },
  { id: 'ideal-gas-law-calculator', name: 'Ideal Gas Law', emoji: '⚗️', color: '#06b6d4', tagline: 'PV = nRT calculations' },
  { id: 'lmtd-calculator', name: 'LMTD Calculator', emoji: '🌡️', color: '#ef4444', tagline: 'Heat exchanger design' },
  { id: 'macro-calculator', name: 'Macro Calculator', emoji: '🥗', color: '#22c55e', tagline: 'Protein, carbs & fat' },
  { id: 'mulch-calculator', name: 'Mulch Calculator', emoji: '🌿', color: '#84cc16', tagline: 'Calculate mulch needed' },
  { id: 'party-drink-calculator', name: 'Party Drink', emoji: '🍹', color: '#ec4899', tagline: 'Plan drinks for your party' },
  { id: 'pipe-flow-calculator', name: 'Pipe Flow', emoji: '🔧', color: '#64748b', tagline: 'Fluid dynamics' },
  { id: 'pressure-drop-calculator', name: 'Pressure Drop', emoji: '📉', color: '#8b5cf6', tagline: 'Piping pressure loss' },
  { id: 'remote-work-savings-calculator', name: 'Remote Work Savings', emoji: '🏠', color: '#06b6d4', tagline: 'Calculate WFH savings' },
  { id: 'reynolds-number-calculator', name: 'Reynolds Number', emoji: '🌊', color: '#0ea5e9', tagline: 'Flow regime analysis' },
  // UK Tax Calculators
  { id: 'uk-100k-tax-trap-calculator', name: 'UK £100k Tax Trap', emoji: '🇬🇧', color: '#ef4444', tagline: '60% tax trap explained' },
  { id: 'uk-child-benefit-calculator', name: 'UK Child Benefit', emoji: '👶', color: '#ec4899', tagline: 'HICBC calculator' },
  { id: 'uk-dividend-tax-calculator', name: 'UK Dividend Tax', emoji: '💷', color: '#f59e0b', tagline: 'Calculate dividend tax' },
  { id: 'uk-pension-calculator', name: 'UK Pension', emoji: '🏦', color: '#22c55e', tagline: 'Plan your retirement' },
  { id: 'uk-salary-sacrifice-calculator', name: 'UK Salary Sacrifice', emoji: '💼', color: '#14b8a6', tagline: 'Tax-efficient benefits' },
  { id: 'uk-stamp-duty-calculator', name: 'UK Stamp Duty', emoji: '🏡', color: '#1e3a8a', tagline: 'SDLT/LBTT/LTT calculator' },
  { id: 'uk-student-loan-calculator', name: 'UK Student Loan', emoji: '🎓', color: '#8b5cf6', tagline: 'Plan 1, 2, 4, 5 repayments' },
  // US Tax Calculators
  { id: 'us-tax-bracket-calculator', name: 'US Tax Bracket', emoji: '🇺🇸', color: '#3b82f6', tagline: '2025 federal tax rates' },
  { id: 'us-self-employment-tax-calculator', name: 'US Self-Employment Tax', emoji: '📋', color: '#22c55e', tagline: '1099 tax calculator' },
  { id: 'us-quarterly-tax-calculator', name: 'US Quarterly Tax', emoji: '📅', color: '#8b5cf6', tagline: '1040-ES payments' },
  { id: 'us-capital-gains-tax-calculator', name: 'US Capital Gains Tax', emoji: '📈', color: '#f59e0b', tagline: 'Stock & crypto taxes' },
  // HSA Calculator
  { id: 'hsa-calculator', name: 'HSA Calculator', emoji: '🏥', color: '#22c55e', tagline: 'Triple tax advantage' },
  // EU Calculators
  { id: 'eu-vat-calculator', name: 'EU VAT Calculator', emoji: '🇪🇺', color: '#3b82f6', tagline: 'All 27 EU countries' },
  { id: 'eu-salary-calculator', name: 'EU Salary Calculator', emoji: '💶', color: '#8b5cf6', tagline: 'Net pay across Europe' },
  // New Calculators
  { id: 'inflation-calculator', name: 'Inflation Calculator', emoji: '📊', color: '#f59e0b', tagline: 'Historic CPI 1920-2025' },
  { id: 'net-worth-calculator', name: 'Net Worth Calculator', emoji: '💎', color: '#22c55e', tagline: 'Assets minus liabilities' },
  { id: 'us-paycheck-calculator', name: 'US Paycheck Calculator', emoji: '💵', color: '#3b82f6', tagline: 'Take-home pay calculator' },
  // Niche Calculators - Phase 1
  { id: 'speeds-feeds-calculator', name: 'Speeds & Feeds', emoji: '⚙️', color: '#64748b', tagline: 'CNC machining calculations' },
  { id: 'fish-stocking-calculator', name: 'Fish Stocking', emoji: '🐟', color: '#0ea5e9', tagline: 'Aquarium capacity guide' },
  { id: 'abv-calculator', name: 'ABV Calculator', emoji: '🍺', color: '#d97706', tagline: 'Homebrew alcohol content' },
  { id: 'clay-shrinkage-calculator', name: 'Clay Shrinkage', emoji: '🏺', color: '#c2410c', tagline: 'Pottery size calculator' },
  { id: 'lye-calculator', name: 'Lye Calculator', emoji: '🧼', color: '#a855f7', tagline: 'Soap making saponification' },
];

// Font loading - use local font files from @fontsource/inter
async function loadFonts() {
  const fontRegularPath = join(projectRoot, 'node_modules', '@fontsource', 'inter', 'files', 'inter-latin-400-normal.woff');
  const fontBoldPath = join(projectRoot, 'node_modules', '@fontsource', 'inter', 'files', 'inter-latin-700-normal.woff');

  return [
    {
      name: 'Inter',
      data: readFileSync(fontRegularPath),
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Inter',
      data: readFileSync(fontBoldPath),
      weight: 700,
      style: 'normal',
    },
  ];
}

// Generate OG image for a calculator
async function generateOGImage(calculator, fonts) {
  const { name, emoji, color, tagline } = calculator;

  // JSX-like structure for satori
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07070a 0%, #141420 50%, #0c0c12 100%)',
          fontFamily: 'Inter',
        },
        children: [
          // Decorative circles
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '-100px',
                left: '-100px',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: color,
                opacity: 0.08,
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '-150px',
                right: '-100px',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: '#a78bfa',
                opacity: 0.06,
              },
            },
          },
          // Emoji
          {
            type: 'div',
            props: {
              style: {
                fontSize: '80px',
                marginBottom: '20px',
              },
              children: emoji,
            },
          },
          // Calculator name
          {
            type: 'div',
            props: {
              style: {
                fontSize: '56px',
                fontWeight: 700,
                color: '#f5f2eb',
                marginBottom: '16px',
                textAlign: 'center',
              },
              children: name,
            },
          },
          // Tagline
          {
            type: 'div',
            props: {
              style: {
                fontSize: '28px',
                color: color,
                marginBottom: '40px',
              },
              children: tagline,
            },
          },
          // Bottom bar
          {
            type: 'div',
            props: {
              style: {
                width: '400px',
                height: '4px',
                borderRadius: '2px',
                background: `linear-gradient(90deg, #c4ff00, ${color}, #a78bfa)`,
                marginBottom: '30px',
              },
            },
          },
          // Branding
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#c4ff00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#07070a',
                    },
                    children: 'B',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '24px',
                      color: '#8888a0',
                    },
                    children: 'Boring Math Calculators',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );

  // Convert SVG to PNG
  const resvg = new Resvg(svg, {
    background: '#07070a',
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  return resvg.render().asPng();
}

// Main function
async function main() {
  console.log('Loading fonts...');
  const fonts = await loadFonts();

  // Ensure output directory exists
  const outputDir = join(projectRoot, 'public', 'og');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Generating ${calculators.length} OG images...`);

  for (const calc of calculators) {
    try {
      const png = await generateOGImage(calc, fonts);
      const outputPath = join(outputDir, `${calc.id}.png`);
      writeFileSync(outputPath, png);
      console.log(`  ✓ ${calc.name} -> ${calc.id}.png`);
    } catch (error) {
      console.error(`  ✗ ${calc.name}: ${error.message}`);
    }
  }

  // Generate default OG image
  try {
    const defaultCalc = {
      id: 'default',
      name: 'Boring Math',
      emoji: '🧮',
      color: '#c4ff00',
      tagline: 'Free Online Calculators',
    };
    const png = await generateOGImage(defaultCalc, fonts);
    writeFileSync(join(outputDir, 'default.png'), png);
    console.log('  ✓ Default OG image');
  } catch (error) {
    console.error(`  ✗ Default: ${error.message}`);
  }

  console.log('\nDone! OG images saved to public/og/');
}

main().catch(console.error);
