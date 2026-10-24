# Presentation freeze gate

Freeze target: **2026-10-24** (presenter-guided default for Oct 26).

Audit SHA 2026-10-24: `5d08bc8a6f79a5e3aa71829461fc79fb4a722757`. Research console remains **preview / not in talk** (production `/research-console/` serves Vite source, not `dist`). See `evidence/baseline-2026-10-24.json`.

## Frozen (presentation path)

| Surface | Status | Notes |
| --- | --- | --- |
| Living world (`/world/`) | **Frozen for presentation** | Pixi world + DOM inspector must work without React. |
| Public packets + graph | **Frozen** | Sparton `WOLF-002` / `XX1990.1484` packet is the demo seed. |
| Inspector → console handoff | **Contract frozen** | Typed query params only (`objectId`, `claimId`, `readerId`, `sourceRevision`). |

## Preview (not presentation-critical)

| Surface | Status | Notes |
| --- | --- | --- |
| Research console (`/research-console/`) | **Preview** | Vite + React + `@assistant-ui/react` LocalRuntime. Deterministic guided Q&A only. No live LLM. |
| LocalRuntime answers | **Preview** | Six guided questions + explicit NOT_ESTABLISHED refusal for free-form history. |

## Promotion rule

Do **not** promote the research console into the Oct 26 presenter path unless:

1. Handoff from inspector opens the console with a valid Sparton claim context.
2. At least three guided questions return ESTABLISHED / INFERENCE / NOT_ESTABLISHED correctly.
3. The living world still runs fully if the console build is absent or fails.

Until then, the world is the presentation; the console is progressive enhancement.

## Build

```bash
npm test
npm run build:demo   # packets + graph + research-console
```

Console-only:

```bash
npm run build:research-console
```
