/**
 * TLDR Promotional Tile Generator
 * Creates promotional images for Chrome Web Store from HTML mockups
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MOCKUPS_DIR = join(__dirname, 'mockups');
const PROMO_DIR = join(__dirname, 'promo');

// Promo tile configurations
const PROMO_TILES = [
  {
    name: 'small-tile-440x280',
    template: 'promo-small-tile.html',
    width: 440,
    height: 280,
    required: true
  },
  {
    name: 'large-tile-920x680',
    template: 'promo-large-tile.html',
    width: 920,
    height: 680,
    required: false
  },
  {
    name: 'marquee-tile-1400x560',
    template: 'promo-marquee-tile.html',
    width: 1400,
    height: 560,
    required: false
  }
];

async function generatePromoTiles() {
  console.log('🎨 TLDR Promotional Tile Generator\n');
  console.log('═'.repeat(50));

  // Ensure promo directory exists
  if (!existsSync(PROMO_DIR)) {
    mkdirSync(PROMO_DIR, { recursive: true });
  }

  const browser = await chromium.launch();

  for (const tile of PROMO_TILES) {
    const templatePath = join(MOCKUPS_DIR, tile.template);

    if (!existsSync(templatePath)) {
      console.log(`\n⚠️  Template not found: ${tile.template}`);
      continue;
    }

    console.log(`\n📐 Generating ${tile.name}...`);
    console.log(`   Size: ${tile.width}×${tile.height}`);
    console.log(`   Required: ${tile.required ? 'Yes' : 'Recommended'}`);

    const page = await browser.newPage();

    // Set viewport to exact dimensions
    await page.setViewportSize({
      width: tile.width,
      height: tile.height
    });

    await page.goto(`file://${templatePath}`, {
      waitUntil: 'networkidle'
    });

    // Wait for fonts to load
    await page.waitForTimeout(1000);

    const outputPath = join(PROMO_DIR, `${tile.name}.png`);

    await page.screenshot({
      path: outputPath,
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: tile.width,
        height: tile.height
      }
    });

    console.log(`   ✅ Saved: ${tile.name}.png`);
    await page.close();
  }

  await browser.close();

  console.log('\n' + '═'.repeat(50));
  console.log('✨ All promotional tiles generated!\n');
  console.log('📁 Location: store/promo/');
  PROMO_TILES.forEach(tile => {
    console.log(`   ${tile.name}.png (${tile.width}×${tile.height})`);
  });

  console.log('\n📤 Upload to Chrome Web Store:');
  console.log('   1. Go to Developer Dashboard → Your Extension');
  console.log('   2. Click "Store listing" tab');
  console.log('   3. Scroll to "Promotional images"');
  console.log('   4. Upload small-tile-440x280.png (required)');
  console.log('   5. Upload large-tile-920x680.png (recommended)');
  console.log('   6. Upload marquee-tile-1400x560.png (optional, for featuring)');
}

generatePromoTiles().catch(console.error);
