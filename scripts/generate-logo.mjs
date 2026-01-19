/**
 * Generate logo.png from SVG for Google Search
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

// SVG logo at 512x512 - calculator design matching favicon
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Solid background for Google (no transparency) -->
  <rect width="512" height="512" fill="#07070a"/>

  <!-- Rounded square accent background -->
  <rect x="56" y="56" width="400" height="400" rx="80" fill="#c4ff00"/>

  <!-- Calculator body -->
  <rect x="128" y="96" width="256" height="320" rx="32" fill="#07070a"/>

  <!-- Screen -->
  <rect x="152" y="120" width="208" height="80" rx="16" fill="#c4ff00"/>

  <!-- Button row 1 -->
  <rect x="152" y="224" width="48" height="48" rx="8" fill="#3a3a3a"/>
  <rect x="232" y="224" width="48" height="48" rx="8" fill="#3a3a3a"/>
  <rect x="312" y="224" width="48" height="48" rx="8" fill="#c4ff00"/>

  <!-- Button row 2 -->
  <rect x="152" y="296" width="48" height="48" rx="8" fill="#3a3a3a"/>
  <rect x="232" y="296" width="48" height="48" rx="8" fill="#3a3a3a"/>
  <rect x="312" y="296" width="48" height="48" rx="8" fill="#3a3a3a"/>

  <!-- Button row 3 -->
  <rect x="152" y="368" width="128" height="32" rx="8" fill="#3a3a3a"/>
  <rect x="312" y="368" width="48" height="32" rx="8" fill="#c4ff00"/>
</svg>`;

// Save SVG version
fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSvg);
console.log('✓ Created logo.svg');

// Try to convert to PNG using sharp if available
async function convertToPng() {
  try {
    const sharp = (await import('sharp')).default;
    const pngBuffer = await sharp(Buffer.from(logoSvg))
      .resize(512, 512)
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, 'logo.png'), pngBuffer);
    console.log('✓ Created logo.png (512x512)');
  } catch (e) {
    console.log('Note: sharp not available, using SVG only');
    console.log('To generate PNG, install sharp: npm install sharp');
    console.log('Or use an online SVG to PNG converter');
  }
}

convertToPng();
