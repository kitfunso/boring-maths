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
