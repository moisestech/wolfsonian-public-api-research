# Offline presentation matrix — World 0.1A

**Protocol:** `npx serve .` → open `/world/` → DevTools Network → Offline (or Wi-Fi off) → complete guided path through Evidence / Residency.

## Critical-path assets

| Asset | Location | Offline |
|---|---|---|
| World HTML/CSS/JS | `world/` | PASS (local) |
| PixiJS 8.8.1 | `world/vendor/pixi.min.mjs` | PASS (vendored) |
| Sparton packet JSON | `demo/data/objects/02-sparton-radio.json` | PASS (local) |
| Residency candidate JSON | `demo/data/object-request-candidates/sim-001.json` | PASS (local) |
| Radio SVG | `demo/assets/objects/sparton-radio.svg` | PASS (local) |
| Agent portraits | none on critical path (letter discs) | PASS (N/A) |
| Google Fonts | removed from `world/index.html` | PASS (system fonts) |
| Public source URL click | `wolfsonian.org` | FAIL expected when offline (external) |

## Interaction under offline (local server)

| Step | Result |
|---|---|
| Initial World load | PASS (verified 2026-10-17 with local vendor Pixi + DOM) |
| Approach / opposition | PASS |
| CONTRADICTION selectable (no auto-skip) | PASS |
| Conversation ≤2 fragments | PASS |
| Evidence triad + materials / citedAt / evidence[] | PASS |
| Restart ×2 | PASS |
| Full Wi-Fi-off run after cache flush | **NOT TESTED in CI** — run on Oct 24 freeze machine |

## Failure notes

- `file://` is unsupported (ES modules + `fetch`). Always use a local HTTP server.
- jsDelivr `+esm` Pixi rewrite is **not** offline-safe (resolves `/npm/...` against CDN). Use `dist/pixi.min.mjs` only.
- Domains external to the demo (public record links) may fail offline; that is acceptable if the in-app evidence fields remain readable.

## Fallback recording

Store a 2–3 minute capture of the full path at:

`.tmp/world-mvp-fallback-YYYYMMDD.mp4`

Document SHA of the freeze commit in the PR checklist.
