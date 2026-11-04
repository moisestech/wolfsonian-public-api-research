import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { classifyAnchorMatch, createLakehouseClient } from '../src/client.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(__dirname, 'fixtures');

function mockFetch(handler) {
  return async (input) => handler(typeof input === 'string' ? input : String(input.url || input));
}

describe('lakehouse readonly client (TEST ONLY fixtures)', () => {
  it('marks 200 application/json as verified', async () => {
    const body = await readFile(path.join(fixtures, 'TEST_ONLY_200.json'), 'utf8');
    const client = createLakehouseClient({
      minDelayMs: 0,
      fetchImpl: mockFetch(async () =>
        new Response(body, {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    });
    const result = await client.getRecord('XX1990.1484');
    assert.equal(result.status, 200);
    assert.equal(result.validation.verified, true);
    assert.equal(result.raw._fixture_label.includes('TEST ONLY'), true);
    assert.equal(classifyAnchorMatch(result), 'VERIFIED MATCH');
  });

  it('treats 404 as NO MATCH without search', async () => {
    const client = createLakehouseClient({
      minDelayMs: 0,
      fetchImpl: mockFetch(async () => new Response('not found', { status: 404 })),
    });
    const result = await client.getRecord('missing');
    assert.equal(result.status, 404);
    assert.equal(result.validation.verified, false);
    assert.equal(classifyAnchorMatch(result), 'NO MATCH');
  });

  it('rejects HTML 200 as not verified', async () => {
    const html = await readFile(path.join(fixtures, 'TEST_ONLY_html.html'), 'utf8');
    const client = createLakehouseClient({
      minDelayMs: 0,
      fetchImpl: mockFetch(async () =>
        new Response(html, { status: 200, headers: { 'content-type': 'text/html' } }),
      ),
    });
    const result = await client.probeRecords();
    assert.equal(result.validation.verified, false);
    assert.equal(result.validation.reason, 'not_json');
  });

  it('stops conceptually on 429 with rate_limit layer', async () => {
    const client = createLakehouseClient({
      minDelayMs: 0,
      fetchImpl: mockFetch(async () =>
        new Response('slow down', {
          status: 429,
          headers: { 'retry-after': '60' },
        }),
      ),
    });
    const result = await client.probeRecords();
    assert.equal(result.status, 429);
    assert.equal(result.error.layer, 'rate_limit');
    assert.equal(classifyAnchorMatch(result), 'CONNECTION FAILED');
  });

  it('maps IP allowlist 403 to CONNECTION FAILED', async () => {
    const client = createLakehouseClient({
      minDelayMs: 0,
      fetchImpl: mockFetch(async () =>
        new Response('Forbidden: IP not authorized', { status: 403 }),
      ),
    });
    const result = await client.probeRecords();
    assert.equal(result.validation.reason, 'http_403_ip_not_authorized');
    assert.equal(classifyAnchorMatch(result), 'CONNECTION FAILED');
  });

  it('maps network failure to CONNECTION FAILED', async () => {
    const client = createLakehouseClient({
      minDelayMs: 0,
      fetchImpl: mockFetch(async () => {
        throw new Error('getaddrinfo ENOTFOUND lakehouse.wolfsonian.org');
      }),
    });
    const result = await client.probeRecords();
    assert.equal(result.status, null);
    assert.equal(result.error.layer, 'DNS');
    assert.equal(classifyAnchorMatch(result), 'CONNECTION FAILED');
  });

  it('enforces max requests per run', async () => {
    const client = createLakehouseClient({
      minDelayMs: 0,
      maxRequests: 1,
      fetchImpl: mockFetch(async () =>
        new Response('{}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    });
    await client.probeRecords();
    await assert.rejects(() => client.probeRecords(), /Max requests/);
  });
});
