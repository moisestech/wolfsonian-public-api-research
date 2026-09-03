# Wolfsonian Public API Research

An independent, early-stage technical notebook for testing The Wolfsonian's publicly documented digital collection API—and a small browser research demo built from manually prepared public-record packets.

This repository is intentionally small and transparent. Its first goal is to verify documented collection endpoints, preserve source provenance, and establish a reproducible path from public metadata to later research experiments.

It is **not** an official Wolfsonian application, production, or museum-authored dataset.

## Research demo

**The Archive Dreams in Public — Institutional Memory Simulation 001**

Public URL (GitHub Pages): [https://moisestech.github.io/wolfsonian-public-api-research/](https://moisestech.github.io/wolfsonian-public-api-research/)

> **Routing note:** Pages is configured for this repository, but the account custom domain currently redirects `*.github.io` project URLs to `www.moises.tech` (Vercel). Until that DNS/host mapping is adjusted, use the local preview below or open the demo from the repository’s `demo/` folder on the feature branch / after merge.

Local preview:

```bash
npm run build:demo
npm test
npx --yes serve .
# then open /demo/
```

Simulation 001 ships **8 curated public-record seeds** (capacity 30), a deterministic institutional-memory graph, **3 precomputed interpretive rounds**, six bounded agents plus The Museum in rounds, and view modes Archive / Interpretation / Simulation / Contradictions / Unknown / Residency. Claim interrogation asks what source supports a statement, who disagrees, and whether the physical object is required. Record deep-read preserves the Trial 001 agent tableau.

Source packets live in [`data/research-seeds/`](data/research-seeds/); interpretations in [`data/interpretations/`](data/interpretations/). The demo does **not** call the live digital API and does **not** republish collection photography.

MiroFish is documented as an out-of-tree AGPL comparative experiment only: [`experiments/mirofish/`](experiments/mirofish/).

## Why this exists

The Wolfsonian Digital Labs describes its projects as prototypes and proofs of concept that share learning in progress. This repository follows that spirit by asking:

> What becomes possible when public collection metadata is treated not as a finished account, but as the starting point for computational research that can later meet physical objects and institutional knowledge?

## Current capabilities

- Browser institutional-memory simulation (static packets, graph, rounds; no live API dependency).
- Record deep-read tableau with six bounded agents and provenance ledger.
- Build documented search, statistics, citation, brief-item, XML metadata, random-item, and thumbnail URLs.
- Ping representative endpoints.
- Detect a human-verification response instead of silently treating HTML as collection data.
- Save timestamped search and item packets locally.
- Build a small thematic seed corpus for later analysis.
- Test URL generation and demo packet integrity without contacting the live service.

## Requirements

- Node.js 20 or newer
- No API key is documented as required

## Setup

```bash
npm install
cp .env.example .env
npm test
npm run ping
```

The project currently has no runtime dependencies, so `npm install` only initializes the local project metadata.

## Examples

```bash
# Search the public collection
npm run search -- --query "world fair" --page 1 --field ZZ

# Search a specific metadata field
npm run search -- --query "1913" --field DA

# Retrieve citation, files, and standard XML metadata for one item
npm run item -- WOLF037299

# Build a small multi-page research corpus
npm run seed -- --query propaganda --pages 3
```

Raw and derived API responses under `data/raw/` and `data/derived/` are ignored by Git by default. Committed demo packets under `demo/data/` are the public research instrument while live connectivity remains blocked.

## Live connectivity status (2026-07-21)

**URL construction and offline tests work. Live automated requests do not yet return collection JSON.**

`npm run ping` reaches `digital.wolfsonian.org`, but every probe is redirected to a Cloudflare Turnstile challenge instead of machine-readable data:

```text
https://digital.wolfsonian.org/turnstile-challenge?destination=/engine/items/citation/json/WOLF037299
```

Observed probes (`citation`, `brief`, `search`, `random`) all fail the same way: HTTP 200, `text/html`, kind `verification-page`. The client detects this and exits with an explicit error rather than saving HTML as JSON.

This is a technical research finding—not a reason to bypass access controls.

### Path to a successful live request

1. Open a documented URL in a regular browser (for example the citation endpoint for `WOLF037299`) and complete the human-verification challenge.
2. Copy the resulting session cookie into local `.env` as `WOLFSONIAN_COOKIE=...` (see `.env.example`). Do not commit `.env`.
3. Re-run `npm run ping`, then `npm run item -- WOLF037299` or `npm run search -- --query "vase"`.
4. Confirm a timestamped packet appears under `data/raw/` (gitignored by default).
5. For sustained research, ask The Wolfsonian technical / Digital Labs team about an approved research route, export, or session workflow.

Until step 1–3 or an approved institutional path succeeds, CLI `search`, `item`, and `seed` will keep reporting the verification page. The browser demo remains usable because it relies on committed static packets.

## Research direction

The longer-term research may explore:

- how objects become connected through public metadata;
- where agents agree or contradict one another;
- the difference between source records and interpretive claims;
- what code cannot know until it encounters physical objects and museum staff;
- how uncertainty and archival absence can remain visible rather than being automatically completed.

See:

- [`docs/api-map.md`](docs/api-map.md)
- [`docs/research-method.md`](docs/research-method.md)
- [`docs/roadmap.md`](docs/roadmap.md)

## Source documentation

Official API documentation: `https://labs.wolfsonian.org/digital/api/`

Digital Labs overview: `https://labs.wolfsonian.org/`

## Status

**Version 0.3.0:** Institutional Memory Simulation 001 (8 seeds, graph, rounds, view modes) plus the 0.1 client/CLI notebook.

| Milestone | State |
|---|---|
| Documented URL builders + offline tests | Done |
| Ping / search / item / seed CLIs | Done |
| Detect Turnstile instead of treating HTML as data | Done |
| Dual-layer research seeds + interpretations | Done |
| Institutional Memory Simulation 001 | Done |
| First successful live JSON packet in `data/raw/` | Blocked on verification or approved research access |
| Expand corpus toward 30 seeds | Next |
| MiroFish comparative run (out of tree) | Documented, not vendored |
