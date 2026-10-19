# Hybrid V3 baseline audit

Date: 2026-10-18  
Repo HEAD at audit: `d592e14`  
Branch for PR A: `feat/wolfsonian-inspector-bridge`

## Verified

| Check | Result |
| --- | --- |
| `npm test` | 21/21 pass |
| `npm run build:demo` | Compiles 6 packets + graph |
| World modules | `main`, `overlays`, `dom-layer`, `world-state`, `world-logic`, `sim-loop`, `renderer` present |
| React / assistant-ui | Not present (correct for progressive enhancement) |

## Sparton claim map (WOLF-002 / 02-sparton-radio)

| ID | Role | claimType | Contradicts |
| --- | --- | --- | --- |
| `futurist` | Futurist | INFERENCE | worker |
| `worker` | Worker | INFERENCE | futurist |
| `archivist` | Provenance gate (not embodied) | — | — |

Object identifiers:

- `objectId` / seed: `WOLF-002`
- Packet demo id: `02-sparton-radio`
- Accession: `XX1990.1484`
- Packet citedAt: `2026-09-02`

## Inspector UX (current)

Stages: `claim` → `evidence` → `residency`, opened after contradiction + conversation line select.

Most fields use safe `textContent` DOM construction. XSS risks remaining:

1. `renderSpeech`: `bubble.innerHTML` interpolates `agent.label` and `agent.conversationLine`
2. Evidence panel: `q.innerHTML` interpolates `model.onsiteQuestion`

## Screenshots

Pre-existing stills preserved on local branch `backup/migration-checkpoint-tmp-screenshots` (`.tmp/world-01-*.png`). Not required on presentation `main`.

## Hybrid handoff contract (PR A)

Query params for `/research-console/`:

- `objectId` — must match approved public corpus seed (e.g. `WOLF-002`)
- `claimId` — reader/claim key (`futurist` \| `worker`)
- `readerId` — same as claimId for embodied readers
- `sourceRevision` — packet `citedAt` or digest
- `sceneCheckpoint` — optional opaque stage token

Reject arbitrary paths, external URLs, and unknown IDs.

## PR B research console (preview)

Branch: `feat/wolfsonian-research-console`

| Check | Result |
| --- | --- |
| Stack | Vite + React 18 + `@assistant-ui/react` LocalRuntime / ChatModelAdapter |
| Live LLM | None — deterministic guided answers only |
| Packet | `research-console/public/data/02-sparton-radio.json` |
| Deploy path | `/research-console/` (built to `research-console/dist/`) |
| Presentation | Preview only — see `FREEZE.md` |
