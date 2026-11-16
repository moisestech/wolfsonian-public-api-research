# World 0.1A capture log — MVP completion

**Date:** 2026-10-17 (America/New_York)  
**Branch:** `feat/wolfsonian-4-sparton-mvp`  
**Environment:** local `serve` → `/world/`, Cursor browser, viewport ~laptop 16:9  
**Object:** Sparton 558-C Radio · XX1990.1484 · public packet only  

SHA is recorded at commit time in git history / PR #13. Update this line when freezing:

`CAPTURE_SHA: 9a75f542d0222694ca2ca5e9593d790d39b59f99`

## Stills (committed)

| File | Beat | Use |
|---|---|---|
| [A-world-before.png](./A-world-before.png) | World / early encounter — one radio, two readers | Slide 4 support |
| [B-contradiction.png](./B-contradiction.png) | Visible CONTRADICTION on opposition axis | **Recommended Slide 5 still** |
| [C-evidence-gate.png](./C-evidence-gate.png) | ESTABLISHED / INFERENCE / NOT ESTABLISHED | Slides 6–7 |

## Artistic one-liner (Slide 5)

Two opposed readings of one archival radio become visible as spatial tension before any sentence has to explain them.

## Staff question (take to Wolfsonian)

In person, which traces of making, repair, or use on the Sparton 558-C would most change whether “streamlined progress” remains a responsible reading of this public record?

## Recording

- Full 60–90s walkthrough: store locally under `.tmp/` (not committed by default).
- Path convention: `.tmp/world-mvp-walkthrough-YYYYMMDD.mp4`

## Rights

Original diagrammatic SVG only. No collection photographs. No internal records.

---

## 2026-10-24 release-audit recapture

**Date/time:** 2026-10-24 16:38 America/New_York  
**SHA tested:** `5d08bc8a6f79a5e3aa71829461fc79fb4a722757` (`origin/main`)  
**Environment:** presenting laptop `Moisess-MacBook-Pro.local`; `python3 -m http.server 4175` → `/world/`; Cursor Chromium; viewport 1280×720  

New stills (local only, not replacing committed A/B/C until artist review):

| File | SHA-256 |
|---|---|
| `.tmp/oct24-baseline/oct24-A-world-before.png` | `f708566d967db9aa4a0237fff6cc8b05124050e92b96038598b8f4f836bb9c95` |
| `.tmp/oct24-baseline/oct24-B-contradiction.png` | `ff9ef0d059b5d61dd129155d5c573e068a14047ef5d6d9fa84d8c4cf1c19c840` |
| `.tmp/oct24-baseline/oct24-C-evidence-gate.png` | `b4f5a366e9b22dd184ff380da3afd7e20f481ac66bd883ab9ff40be57e2e47f3` |

Walkthrough / fallback MP4: **NOT TESTED** — `ffmpeg` not present; no playable file was written. Do not treat planned `.tmp/world-mvp-*.mp4` names as existing media.

Baseline manifest: [baseline-2026-10-24.json](./baseline-2026-10-24.json)
