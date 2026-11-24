/**
 * Browser check for the real built React console, using local public-site
 * assets with Vercel's research-console rewrite reproduced on localhost.
 * No model API, museum login, Cloudinary fetch or private collection data.
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(project, 'public-site');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  let pathname;
  try { pathname = new URL(req.url || '/', 'http://localhost').pathname; }
  catch { res.writeHead(400); res.end(); return; }
  if (pathname === '/research-console' || pathname === '/research-console/')
    pathname = '/research-console/dist/index.html';
  else if (pathname.startsWith('/research-console/'))
    pathname = '/research-console/dist/' + pathname.slice('/research-console/'.length);
  else { res.writeHead(404); res.end(); return; }
  const file = resolve(root, '.' + pathname);
  if (!file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
  try {
    const data = await readFile(file);
    res.writeHead(200, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  } catch { res.writeHead(404); res.end(); }
});

let browser;
try {
  await new Promise((yes, no) => server.listen(0, '127.0.0.1', err => err ? no(err) : yes()));
  const port = server.address().port;
  const base = 'http://127.0.0.1:' + port;
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(base + '/research-console/?roomId=radio-and-television');
  await page.getByRole('heading', { name: 'When does a household become an audience?' }).waitFor();
  assert.match(await page.locator('.preview-badge').innerText(), /no live LLM/);
  await page.getByRole('button', { name: 'Why are Radio and Television paired?' }).click();
  await page.locator('.source-card').first().waitFor({ timeout: 12000 });
  assert.equal(await page.locator('.source-card').count(), 2);
  await page.locator('.source-card summary').first().click();
  const sources = (await page.locator('.source-card').allInnerTexts()).join(' | ');
  assert.match(sources, /2012\.6\.1/);
  assert.match(sources, /XX1990\.1484/);
  assert.match(sources, /SHA-256 of approved public projection/);
  const trace = await page.locator('.operation-trace').last().innerText();
  assert.match(trace, /tool.started/);
  assert.match(trace, /tool.completed/);
  assert.match(trace, /run.completed/);
  assert.match(trace, /ms measured/);
  const relation = await page.locator('.status--not_established').last().innerText();
  assert.match(relation, /Historical relationship NOT ESTABLISHED/);
  await mkdir(resolve(project, 'artifacts'), { recursive: true });
  await page.screenshot({ path: resolve(project, 'artifacts/radio-tv-console-desktop.png'), fullPage: true });

  await page.getByRole('button', { name: 'Test: reject a fabricated citation' }).click();
  await page.locator('.error').last().waitFor({ timeout: 12000 });
  assert.match(await page.locator('.error').last().innerText(), /UNKNOWN_EVIDENCE_REF/);
  assert.match(await page.locator('.operation-trace').last().innerText(), /run.blocked/);
  assert.equal(await page.locator('.source-card').count(), 2, 'Earlier successful results remain visible');
  await page.screenshot({ path: resolve(project, 'artifacts/radio-tv-console-blocked.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: resolve(project, 'artifacts/radio-tv-console-mobile.png'), fullPage: true });
  const width = await page.locator('.radio-tv-shell').evaluate(el => el.getBoundingClientRect().width);
  assert.ok(width < 390 && width > 0, 'Console shell fits a narrow viewport');
  const horizontalOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth + 2);
  assert.equal(horizontalOverflow, false, 'No horizontal overflow on mobile');
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  console.log('Radio TV browser smoke: grounded sources, actual trace, blocked citation, mobile PASS');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
