#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FROZEN_ANCHORS, WATCH_FIELDS, annotateField } from './anchors.mjs';
import { classifyAnchorMatch, createLakehouseClient } from './client.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const OUT_DIR = path.join(REPO_ROOT, '.tmp', 'lakehouse-20261104');

function sha256(text) {
  return createHash('sha256').update(String(text)).digest('hex');
}

function summarize(result) {
  return {
    url: result.query?.url,
    status: result.status,
    retrievedAt: result.retrievedAt,
    verified: result.validation?.verified === true,
    reason: result.validation?.reason,
    errorLayer: result.error?.layer || null,
    errorMessage: result.error?.message || null,
  };
}

async function saveRaw(name, result) {
  await mkdir(path.join(OUT_DIR, 'raw'), { recursive: true });
  const body =
    typeof result.raw === 'string' ? result.raw : JSON.stringify(result.raw, null, 2);
  const file = path.join(OUT_DIR, 'raw', `${name}.json`);
  const payload = {
    url: result.query?.url,
    retrievedAt: result.retrievedAt,
    status: result.status,
    validation: result.validation,
    error: result.error,
    body_sha256: sha256(body || ''),
    // Truncate large verified bodies in the sidecar; full body only if small or unverified short text
    raw_preview:
      typeof result.raw === 'string'
        ? result.raw.slice(0, 500)
        : result.validation?.verified
          ? '[verified JSON omitted from console; see hash]'
          : result.raw,
  };
  await writeFile(file, JSON.stringify(payload, null, 2));
  if (result.validation?.verified && result.raw && typeof result.raw === 'object') {
    await writeFile(
      path.join(OUT_DIR, 'raw', `${name}.body.json`),
      JSON.stringify(result.raw, null, 2),
    );
  }
  return { file, sha256: payload.body_sha256 };
}

async function cmdProbe(client) {
  const result = await client.probeRecords(1, 0);
  const saved = await saveRaw('probe-records-limit1', result);
  console.log(JSON.stringify({ ...summarize(result), saved }, null, 2));
  return result;
}

async function cmdAnchors(client) {
  /** @type {object[]} */
  const rows = [];
  for (const anchor of FROZEN_ANCHORS) {
    const exact = await client.getRecord(anchor.accessionNumber);
    await saveRaw(`exact-${anchor.seedId}`, exact);

    let search = null;
    const exactMiss =
      exact.status === 404 ||
      (exact.validation?.verified &&
        (exact.raw == null ||
          (typeof exact.raw === 'object' &&
            !Array.isArray(exact.raw) &&
            Object.keys(exact.raw).length === 0)));

    if (exactMiss && client.requestCount < 12) {
      search = await client.search(anchor.titleFragment);
      await saveRaw(`search-${anchor.seedId}`, search);
    }

    const match = classifyAnchorMatch(exact, search);
    const fieldNotes =
      exact.validation?.verified && typeof exact.raw === 'object' && exact.raw
        ? WATCH_FIELDS.map((field) => annotateField(exact.raw, field))
        : WATCH_FIELDS.map((field) => ({
            path: field,
            status: 'NOT_RETURNED',
            value: null,
          }));

    const row = {
      seedId: anchor.seedId,
      accessionNumber: anchor.accessionNumber,
      titleFragment: anchor.titleFragment,
      match,
      exact: summarize(exact),
      search: search ? summarize(search) : null,
      fields: fieldNotes,
    };
    rows.push(row);
    console.log(
      `${anchor.seedId}\t${anchor.accessionNumber}\t${match}\tHTTP ${exact.status}\t${exact.validation?.reason}`,
    );
  }

  await mkdir(OUT_DIR, { recursive: true });
  const reportPath = path.join(OUT_DIR, 'anchor-report.json');
  await writeFile(
    reportPath,
    JSON.stringify(
      {
        retrievedAt: new Date().toISOString(),
        requestCount: client.requestCount,
        rows,
      },
      null,
      2,
    ),
  );
  console.log(`Wrote ${reportPath}`);
  return rows;
}

async function main() {
  const [cmd] = process.argv.slice(2);
  const baseUrl = process.env.LAKEHOUSE_BASE_URL || undefined;
  const client = createLakehouseClient({ baseUrl });

  if (cmd === 'probe') {
    const result = await cmdProbe(client);
    process.exitCode = result.validation?.verified ? 0 : 2;
    return;
  }
  if (cmd === 'anchors') {
    const rows = await cmdAnchors(client);
    const anyVerified = rows.some((row) => row.match === 'VERIFIED MATCH');
    process.exitCode = anyVerified ? 0 : 2;
    return;
  }

  console.error('Usage: node src/cli.mjs <probe|anchors>');
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
