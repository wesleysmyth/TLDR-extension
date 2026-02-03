/**
 * TLDR Chrome Web Store Asset Generator
 * Uses Playwright to capture professional screenshots and promotional tiles
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MOCKUPS_DIR = join(__dirname, 'mockups');
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
const PROMO_DIR = join(__dirname, 'promo');

// Ensure output directories exist
[SCREENSHOTS_DIR, PROMO_DIR].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

const ASSETS = [
  // Screenshots (1280x800)
  {
    input: 'screenshot-1-hero.html',
    output: join(SCREENSHOTS_DIR, 'screenshot-1-hero.png'),
    width: 1280,
    height: 800,
    type: 'screenshot'
  },
  {
    input: 'screenshot-2-options.html',
    output: join(SCREENSHOTS_DIR, 'screenshot-2-options.png'),
    width: 1280,
    height: 800,
    type: 'screenshot'
  },
  {
    input: 'screenshot-3-before-after.html',
    output: join(SCREENSHOTS_DIR, 'screenshot-3-before-after.png'),
    width: 1280,
    height: 800,
    type: 'screenshot'
  },
  {
    input: 'screenshot-4-sites.html',
    output: join(SCREENSHOTS_DIR, 'screenshot-4-sites.png'),
    width: 1280,
    height: 800,
    type: 'screenshot'
  },
  {
    input: 'screenshot-5-setup.html',
    output: join(SCREENSHOTS_DIR, 'screenshot-5-setup.png'),
    width: 1280,
    height: 800,
    type: 'screenshot'
  },
  // Promotional Tiles
  {
    input: 'promo-small-tile.html',
    output: join(PROMO_DIR, 'small-tile-440x280.png'),
    width: 440,
    height: 280,
    type: 'promo'
  },
  {
    input: 'promo-large-tile.html',
    output: join(PROMO_DIR, 'large-tile-920x680.png'),
    width: 920,
    height: 680,
    type: 'promo'
  }
];

async function captureAssets() {
  console.log('🎨 TLDR Chrome Web Store Asset Generator\n');
  console.log('═'.repeat(50));

  const browser = await chromium.launch();

  for (const asset of ASSETS) {
    const inputPath = join(MOCKUPS_DIR, asset.input);

    if (!existsSync(inputPath)) {
      console.log(`⚠️  Missing: ${asset.input}`);
      continue;
    }

    console.log(`\n📸 Capturing: ${asset.input}`);
    console.log(`   Size: ${asset.width}x${asset.height}`);

    const page = await browser.newPage();

    // Set viewport to exact dimensions
    await page.setViewportSize({
      width: asset.width,
      height: asset.height
    });

    // Navigate to the HTML file
    await page.goto(`file://${inputPath}`, {
      waitUntil: 'networkidle'
    });

    // Wait for fonts to load
    await page.waitForTimeout(500);

    // Capture screenshot
    await page.screenshot({
      path: asset.output,
      type: 'png'
    });

    await page.close();

    console.log(`   ✅ Saved: ${asset.output.split('/').pop()}`);
  }

  await browser.close();

  console.log('\n' + '═'.repeat(50));
  console.log('✨ All assets generated!\n');

  // Summary
  console.log('📁 Screenshots:');
  ASSETS.filter(a => a.type === 'screenshot').forEach(a => {
    console.log(`   ${a.output.split('/').pop()}`);
  });

  console.log('\n📁 Promotional Tiles:');
  ASSETS.filter(a => a.type === 'promo').forEach(a => {
    console.log(`   ${a.output.split('/').pop()}`);
  });

  console.log('\n🚀 Ready for Chrome Web Store upload!');
}

captureAssets().catch(console.error);
