#!/usr/bin/env node
/**
 * Archive Dreams in Public — bounded, read-only Wolfsonian Lakehouse probe.
 * Node >= 20. No dependencies. NEVER writes inside this repository.
 * Run: node scripts/lakehouse-smoke-20261104.mjs
 *
 * This is a test of API access and data provenance, NOT a live artwork adapter.
 * No harvesting, authorization bypass, image downloads, or production changes.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

const origin = process.env.LAKEHOUSE_BASE_URL || "https://lakehouse.wolfsonian.org";
const anchors = [
  { packet: "WOLF-001", accession: "86.17.1", title: "Trylon Perisphere" },
  { packet: "WOLF-002", accession: "XX1990.1484", title: "Sparton 558-C" },
  { packet: "WOLF-003", accession: "XM1999.108.8", title: "Machine Age Exposition" },
  { packet: "WOLF-004", accession: "85.7.383a,b", title: "Mappemonde" }
];
const runId = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = join(tmpdir(), "archive-dreams-lakehouse-readonly", runId);
const manifest = { runId, origin, dateUTC: new Date().toISOString(), requestLimit: 12, minimumGapMs: 1000, notes: "Research only. Raw public API responses saved outside repository. No images downloaded.", requests: [], anchors: [] };
let lastStartedAt = 0;
let numberOfRequests = 0;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function briefError(err) {
  const code = err?.cause?.code || err?.code || null;
  const message = String(err?.message || err);
  const category = code === "ENOTFOUND" || code === "EAI_AGAIN" ? "DNS_ERROR" :
    code?.startsWith?.("ERR_TLS") ? "TLS_ERROR" :
    err?.name === "TimeoutError" || err?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR";
  return { category, code, message };
}
function specimen(value) {
  const object = value?.data?.record || value?.data?.[0] || value?.record || value?.results?.[0] ||
    (Array.isArray(value) ? value[0] : value?.data || value);
  if (!object || typeof object !== "object") return { responseShape: typeof value };
  const keys = Object.keys(object);
  const pick = {};
  for (const key of ["id","accession_number","accession","title","source_system","source","creators_with_roles","exhibit_label","exhibit_title","field_subject","has_ocr","ocr_snippet"]) {
    if (Object.prototype.hasOwnProperty.call(object,key)) pick[key] = typeof object[key] === "string" ? object[key].slice(0,300) : object[key];
  }
  return { responseKeys: keys.slice(0,45), selectedFields: pick };
}
async function requestJSON(path, label) {
  if (++numberOfRequests > manifest.requestLimit) throw new Error("RUN_REQUEST_BUDGET_EXHAUSTED");
  const waited = Math.max(0, manifest.minimumGapMs - (Date.now() - lastStartedAt));
  if (waited) await sleep(waited);
  lastStartedAt = Date.now();
  const url = new URL(path, origin).toString();
  const result = { label, url, attemptedAtUTC: new Date().toISOString(), requestNumber: numberOfRequests };
  try {
    const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000), redirect: "follow" });
    result.status = response.status;
    result.contentType = response.headers.get("content-type");
    result.retryAfter = response.headers.get("retry-after");
    if (response.status === 429) {
      result.error = "RATE_LIMITED_STOP";
      manifest.requests.push(result);
      throw Object.assign(new Error("Lakehouse returned HTTP 429; stop, do not retry automatically."), { stop: true });
    }
    const rawText = await response.text();
    if (!result.contentType?.includes("json")) {
      result.error = "NON_JSON_RESPONSE";
      result.preview = rawText.slice(0, 120).replace(/\s+/g, " ");
    } else {
      try {
        result.json = JSON.parse(rawText);
        result.sha256 = createHash("sha256").update(rawText).digest("hex");
        result.summary = specimen(result.json);
      } catch {
        result.error = "INVALID_JSON_RESPONSE";
      }
    }
    manifest.requests.push({ ...result, json: undefined });
  } catch (err) {
    if (err?.stop) throw err;
    result.error = briefError(err);
    manifest.requests.push(result);
  }
  return result;
}
const safeName = value => value.replace(/[^a-zA-Z0-9_.-]/g, "_");
async function saveResult(result, filename) {
  if (result.json !== undefined) {
    await writeFile(join(outDir, filename), JSON.stringify({retrievedAtUTC:result.attemptedAtUTC,url:result.url,sha256:result.sha256,raw:result.json},null,2));
  }
}

await mkdir(outDir,{recursive:true});
let stopped = false;
try {
  const probe = await requestJSON("/api/v1/records?limit=1&offset=0", "one-record-health-probe");
  await saveResult(probe, "probe.json");
  if (probe.error && typeof probe.error === "object" && ["DNS_ERROR","TLS_ERROR","TIMEOUT","NETWORK_ERROR"].includes(probe.error.category)) {
    console.error("Environment connection failed before reliable HTTP JSON. Check DNS/HTTPS/host with Andrius.");
    stopped = true;
  } else {
    for (const a of anchors) {
      const exactPath = "/api/v1/records/" + encodeURIComponent(a.accession);
      const exact = await requestJSON(exactPath, a.packet + "-exact");
      await saveResult(exact, a.packet + "-exact.json");
      const item = { ...a, status: exact.error ? exact.error : exact.status, httpStatus: exact.status ?? null, exactURL: exact.url, responseSummary: exact.summary || null, identityVerified: false };
      if (exact.json !== undefined) {
        item.identityVerified = JSON.stringify(exact.json).toLowerCase().includes(a.accession.toLowerCase());
        item.resultLabel = item.identityVerified ? "ACCESSION_PRESENT_IN_RETURNED_JSON" : "REVIEW_IDENTITY_MANUALLY";
      } else if (exact.status === 404) {
        const search = await requestJSON("/api/v1/search?q=" + encodeURIComponent(a.title), a.packet + "-fallback-search");
        await saveResult(search, a.packet + "-search.json");
        item.searchURL = search.url;
        item.searchStatus = search.status ?? search.error;
        item.resultLabel = "POSSIBLE_MATCHES_REQUIRE_HUMAN_REVIEW";
      }
      manifest.anchors.push(item);
      console.log(a.packet + " " + a.accession + ": HTTP " + (exact.status ?? "no response") + " " + (item.resultLabel || JSON.stringify(exact.error || "")));
    }
  }
} catch (err) {
  stopped = true;
  console.error("Stopped safely:", err.message);
}
manifest.endedAtUTC = new Date().toISOString();
manifest.stoppedEarly = stopped;
await writeFile(join(outDir,"manifest.json"),JSON.stringify(manifest,null,2));
console.log("Research evidence saved locally (outside repo): " + outDir);
console.log("Requests made: " + numberOfRequests + " / " + manifest.requestLimit);
console.log("Important: HTTP 200/JSON does not by itself prove the object's historical identity or image-use permission.");
