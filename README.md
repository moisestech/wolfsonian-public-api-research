# Wolfsonian Public API Research

An independent research notebook exploring The Wolfsonian–FIU's publicly documented digital collection—and a static browser **Research Demo 001** for sharing the methodology before onsite work.

It is **not** an official Wolfsonian application, production system, or museum-authored dataset.

## Research Demo 001

**The Archive Dreams in Public — Institutional Memory Simulation**

Intended public URL: [https://moisestech.github.io/wolfsonian-public-api-research/](https://moisestech.github.io/wolfsonian-public-api-research/)

### Manual Pages setup (required once)

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. After merge (or on this feature branch via workflow_dispatch), the [pages workflow](.github/workflows/pages.yml) deploys `demo/`.
3. **DNS caveat:** if `*.github.io` redirects to `www.moises.tech` (Vercel), remove or adjust the user/org Pages custom domain so project Pages resolve on GitHub—or add a Vercel rewrite. Until then, use local preview.

Local preview:

```bash
npm run build:demo
npm test
npx --yes serve .
# open /demo/
```

### What Luna should see

- **6 verified public-record packets** (capacity 30)
- Deterministic graph + **5 simulation rounds**
- Six bounded agents + The Museum (in rounds)
- Views: Archive / Interpretation / Simulation / Contradictions / Unknown / **Residency**
- Residency lists **object-request candidates** generated from contradictions
- Counterfeit claims labeled `FABRICATION_TEST` and challenged by Archivist
- No live API, no LLM, no museum photography

Data layout:

- Source: [`data/public/objects/`](data/public/objects/)
- Interpretation / simulations / requests: [`data/research/`](data/research/)

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

**Version 0.4.0 — Research Demo 001**

| Milestone | State |
|---|---|
| CLI URL builders + Turnstile detection | Done |
| Dual-layer public/research data | Done |
| Research Demo 001 (6 seeds, 5 rounds, Residency requests) | Done |
| GitHub Actions Pages workflow | Done (DNS may still need manual fix) |
| Live API packet under `data/raw/` | Blocked on verification / approved access |
| Expand toward 30 seeds | Next |
| Generative LLM agents | Later (deterministic baseline first) |
