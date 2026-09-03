import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = fileURLToPath(new URL('../docs/images/', import.meta.url));
fs.mkdirSync(outDir, { recursive: true });

const TARGET_URL = 'https://wolfsonian-research.vercel.app/demo/';

async function screenshotOverview(page) {
  await page.locator('#enter-sim').click();
  await page.waitForTimeout(5000);

  // Wait for the graph shell to become visible.
  await page.waitForFunction(() => !document.getElementById('sim-shell')?.hidden, { timeout: 60000 });
  await page.waitForSelector('#graph-canvas', { timeout: 60000 });
  await page.waitForSelector('#claim-list li', { timeout: 60000 });

  await page.locator('#sim-shell').screenshot({ path: path.join(outDir, 'demo-overview.png') });
}

async function screenshotResidency(page) {
  const residencyTab = page
    .locator('#view-tabs button[role="tab"]')
    .filter({ hasText: 'Residency' })
    .first();

  await residencyTab.click();

  await page.waitForFunction(() => {
    const el = document.querySelector('#round-title');
    return Boolean(el && el.textContent && el.textContent.includes('object-request candidates'));
  });

  await page.locator('#sim-shell').screenshot({ path: path.join(outDir, 'residency-view.png') });
}

async function screenshotDeepRead(page) {
  // Return to a view where the graph record nodes are visible & interactive.
  const simTab = page
    .locator('#view-tabs button[role="tab"]')
    .filter({ hasText: 'Simulation' })
    .first();
  if (await simTab.count()) await simTab.click();

  await page.waitForSelector('#graph-canvas', { timeout: 60000 });

  // Click the first record node in the SVG.
  await page
    .locator('#graph-canvas [role="button"][aria-label^="Select record"]')
    .first()
    .click();

  await page.waitForSelector('#open-deep-read:not([hidden])', { timeout: 60000 });
  await page.locator('#open-deep-read').click();
  await page.waitForSelector('#deep-read:not([hidden])', { timeout: 60000 });

  await page.locator('#deep-read').screenshot({ path: path.join(outDir, 'claim-provenance.png') });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 768 } });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

  // Overview screenshot (enter simulation and show the main panels).
  await screenshotOverview(page);

  // Residency screenshot.
  await screenshotResidency(page);

  // Deep-read / provenance screenshot.
  await screenshotDeepRead(page);

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

