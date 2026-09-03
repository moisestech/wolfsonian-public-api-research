# Wolfsonian Public API Research

An independent research notebook exploring The Wolfsonian–FIU's publicly documented digital collection—and a static browser **Research Demo 001** for sharing the methodology before onsite work.

It is **not** an official Wolfsonian application, production system, or museum-authored dataset.

## Research Demo 001

**The Archive Dreams in Public — Institutional Memory Simulation**

**Public demo URL (preferred):** [https://wolfsonian-research.vercel.app](https://wolfsonian-research.vercel.app)  
(GitHub remains the canonical research repository. GitHub Pages remains optional; see hosting note below.)

### What to notice in under a minute

1. These are **public** Wolfsonian source records (manually prepared packets).
2. Agents are **bounded interpretive lenses**, not oracles.
3. **Interpretation is separated** from evidence.
4. Contradictions are **useful research signals**, not “AI errors.”
5. **Uncertainty is visible** (`UNCERTAIN` / gaps).
6. Output includes **onsite questions** and object-request candidates (Residency).
7. This is an **early research instrument**, not a finished museum product or truth engine.

### Local preview

```bash
npm run build:demo
npm test
npx --yes serve .
# open /demo/
```

### Data layout (source of truth vs build output)

| Path | Role |
|---|---|
| [`data/public/objects/`](data/public/objects/) | Layer A — public source packets (edit here) |
| [`data/research/`](data/research/) | Layer B — interpretations, simulations, object-request candidates |
| [`demo/data/`](demo/data/) | **Committed build output** of `npm run build:demo` for static hosting |

Do not hand-edit `demo/data` as authoritative; regenerate after changing Layer A/B.

### Hosting

**Vercel (recommended for Luna):** separate project `wolfsonian-research`, production from `main` once the PR stack merges (or from this feature branch for preview). Config: [`vercel.json`](vercel.json). Do not attach `moises.tech`.

Manual Vercel steps if CLI is unavailable:

1. Import `moisestech/wolfsonian-public-api-research` into Vercel.
2. Framework preset: Other. Build command: `npm run build:demo`. Output directory: `.`
3. Project name: `wolfsonian-research` → `https://wolfsonian-research.vercel.app`
4. Confirm the deploy serves `/demo/` and contains no collection photography.

**GitHub Pages (optional):** [`.github/workflows/pages.yml`](.github/workflows/pages.yml) builds and deploys on `main`. Account-level `*.github.io` → `www.moises.tech` redirects can still break project Pages; fixing that DNS is separate from this research repo and can destabilize the personal site—prefer Vercel for the shareable demo URL.

### Corpus shipped in the demo

- **6 verified public-record packets** (schema capacity 30; WOLF-007/008 remain as corpus extras)
- Deterministic graph + **5 simulation rounds**
- Six bounded agents + The Museum (in rounds)
- Views: Archive / Interpretation / Simulation / Contradictions / Unknown / **Residency**
- Residency lists **object-request candidates** from contradictions
- Counterfeit claims labeled `FABRICATION_TEST` and challenged by Archivist
- No live API, no LLM, no museum photography

Docs: [`docs/demo-methodology.md`](docs/demo-methodology.md) · [`docs/simulation-architecture.md`](docs/simulation-architecture.md) · [`docs/object-selection-method.md`](docs/object-selection-method.md) · [`docs/mirofish-comparison.md`](docs/mirofish-comparison.md)

## Why this exists

> What kind of institutional world can be inferred from a museum's public digital record, and what remains unavailable until code encounters physical objects and the people who care for them?

## Current capabilities

- Browser Research Demo 001 (static packets, graph, rounds, residency requests)
- Record deep-read tableau with six bounded agents and provenance ledger
- Build documented search, statistics, citation, brief-item, XML metadata, random-item, and thumbnail URLs
- Ping representative endpoints; detect Turnstile verification pages
- Save timestamped search and item packets locally (CLI)

## Requirements

- Node.js 20 or newer
- No API key required for the demo

## Setup

```bash
npm install
cp .env.example .env
npm run build:demo
npm test
npm run ping
```

## Live API status

Automated requests to `digital.wolfsonian.org` may receive Cloudflare Turnstile. The demo does not depend on live access. See README history and `.env.example` for optional local cookie research.

## Status

**Version 0.4.0 — Research Demo 001 (Luna-share hardening)**

| Milestone | State |
|---|---|
| CLI URL builders + Turnstile detection | Done |
| Dual-layer public/research data | Done |
| Research Demo 001 (6 seeds, 5 rounds, Residency requests) | Done |
| Institution-safe packet language (`not_established_in_public_packet`) | Done |
| Vercel static config for stable demo URL | Done (project connect may be manual) |
| GitHub Actions Pages workflow | Optional secondary path |
| Live API packet under `data/raw/` | Blocked on verification / approved access |
| Expand toward 30 seeds | Later |
| Generative LLM agents | Later (deterministic baseline first) |

## Recommended merge sequence (do not skip order)

Stacked PRs should land as:

1. PR #1 `feature/research-demo-v0` → `main`
2. Retarget PR #2 to `main`, then merge
3. Retarget PR #3 to `main`, then merge

Do not merge #3 onto `main` before #1 and #2.
