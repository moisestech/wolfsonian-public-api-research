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

---

## 2026-10-24 presenting-laptop run

**Machine:** `Moisess-MacBook-Pro.local` (Darwin 27.0.0 arm64)  
**SHA:** `5d08bc8a6f79a5e3aa71829461fc79fb4a722757`  
**Browser:** Cursor IDE Chromium  
**Local server:** `python3 -m http.server 4175 --bind 127.0.0.1` from repo root  

### Mini-SOP (local World)

```bash
cd /path/to/wolfsonian-public-api-research
python3 -m http.server 4175 --bind 127.0.0.1
# open http://127.0.0.1:4175/world/
# do not use file://
```

`npx serve .` is equivalent. World reads packets from `/demo/data/`.

### Results

| Check | Result |
|---|---|
| Wi-Fi off (`en0`) + curl local HTML/Pixi/packet/SVG/CSS/main | **PASS** (HTTP 200) |
| Wi-Fi off + curl `google.com` / `wolfsonian.org` | **FAIL expected** (DNS) |
| Wi-Fi restored after test | **PASS** (`en0` On) |
| Chrome DevTools/CDP `Network.emulateNetworkConditions(offline)` | **FAIL** as a method — blocks localhost too (`chrome-error://`) |
| Full interactive path + Restart ×2 on local HTTP (network on) | **PASS** |
| Full interactive path in browser while OS Wi-Fi off | **NOT TESTED** (second OS Wi-Fi toggle blocked mid-session after the asset test already restored power) |
| Fallback MP4 playback without wifi | **NOT TESTED** (no MP4 file exists) |

Do not use DevTools Offline as a substitute for OS Wi-Fi off on this machine: it blackholes `127.0.0.1`.
