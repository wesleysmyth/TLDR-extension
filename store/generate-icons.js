/**
 * TLDR Icon Generator
 * Creates icons at all required sizes using Source Serif 4 font
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATE_PATH = join(__dirname, 'mockups', 'icon-template.html');
const ICONS_DIR = join(__dirname, '..', 'assets', 'icons');

// Icon sizes required by Chrome extensions
const SIZES = [16, 32, 48, 128];

async function generateIcons() {
  console.log('🎨 TLDR Icon Generator\n');
  console.log('═'.repeat(40));

  // Ensure icons directory exists
  if (!existsSync(ICONS_DIR)) {
    mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Read template
  const template = readFileSync(TEMPLATE_PATH, 'utf-8');

  const browser = await chromium.launch();

  for (const size of SIZES) {
    console.log(`\n📐 Generating ${size}x${size} icon...`);

    // Create HTML for this size
    const html = template.replace('icon-SIZE', `icon-${size}`);
    const tempPath = join(__dirname, `temp-icon-${size}.html`);
    writeFileSync(tempPath, html);

    const page = await browser.newPage();

    // Set viewport to exact size with some padding
    await page.setViewportSize({
      width: size + 20,
      height: size + 20
    });

    await page.goto(`file://${tempPath}`, {
      waitUntil: 'networkidle'
    });

    // Wait for font to load
    await page.waitForTimeout(500);

    // Find the icon element and screenshot just that
    const iconElement = await page.$(`.icon-${size}`);

    if (iconElement) {
      const outputPath = join(ICONS_DIR, `icon-${size}.png`);
      await iconElement.screenshot({
        path: outputPath,
        omitBackground: true // Transparent background
      });
      console.log(`   ✅ Saved: icon-${size}.png`);
    }

    await page.close();

    // Clean up temp file
    try {
      const fs = await import('fs/promises');
      await fs.unlink(tempPath);
    } catch {}
  }

  await browser.close();

  console.log('\n' + '═'.repeat(40));
  console.log('✨ All icons generated!\n');
  console.log('📁 Location: assets/icons/');
  SIZES.forEach(size => {
    console.log(`   icon-${size}.png`);
  });

  console.log('\n🔄 Run `npm run build` to update the dist folder');
}

generateIcons().catch(console.error);
