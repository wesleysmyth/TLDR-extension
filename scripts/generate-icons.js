/**
 * Icon Generator for TLDR Extension
 * Creates PNG icons from SVG template using Sharp
 *
 * Run with: node scripts/generate-icons.js
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'assets', 'icons');

// Ensure icons directory exists
mkdirSync(iconsDir, { recursive: true });

// SVG template for the TLDR icon (designed at 128x128)
const svgTemplate = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="120" height="120" rx="24" fill="url(#grad)"/>
  <text x="64" y="76" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700" fill="white" text-anchor="middle">TL</text>
  <rect x="28" y="86" width="72" height="6" rx="3" fill="white" fill-opacity="0.9"/>
</svg>
`;

// Icon sizes needed for Chrome extension
const sizes = [16, 32, 48, 128];

async function generateIcons() {
  console.log('Generating TLDR extension icons...\n');

  for (const size of sizes) {
    const filename = `icon-${size}.png`;
    const filepath = join(iconsDir, filename);

    await sharp(Buffer.from(svgTemplate))
      .resize(size, size)
      .png()
      .toFile(filepath);

    console.log(`✓ Created ${filename}`);
  }

  console.log('\nDone! Icons created in assets/icons/');
}

generateIcons().catch((error) => {
  console.error('Failed to generate icons:', error);
  process.exit(1);
});
