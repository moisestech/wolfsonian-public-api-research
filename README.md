# Wolfsonian Public API Research

An independent, early-stage technical notebook for testing The Wolfsonian's publicly documented digital collection API.

This repository is intentionally small and transparent. Its first goal is to verify documented collection endpoints, preserve source provenance, and establish a reproducible path from public metadata to later research experiments.

It is **not** an official Wolfsonian application, production, or museum-authored dataset.

## Why this exists

The Wolfsonian Digital Labs describes its projects as prototypes and proofs of concept that share learning in progress. This repository follows that spirit by asking:

> What becomes possible when public collection metadata is treated not as a finished account, but as the starting point for computational research that can later meet physical objects and institutional knowledge?

## Current capabilities

- Build documented search, statistics, citation, brief-item, XML metadata, random-item, and thumbnail URLs.
- Ping representative endpoints.
- Detect a human-verification response instead of silently treating HTML as collection data.
- Save timestamped search and item packets locally.
- Build a small thematic seed corpus for later analysis.
- Test URL generation without contacting the live service.

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

Raw and derived API responses are ignored by Git by default. This prevents the repository from accidentally republishing a growing data mirror before rights, scale, and research needs are clarified.

## Live connectivity status (2026-07-21)

**URL construction and offline tests work. Live automated requests do not yet return collection JSON.**

`npm run ping` reaches `digital.wolfsonian.org`, but every probe is redirected to a Cloudflare Turnstile challenge instead of machine-readable data:

```text
https://digital.wolfsonian.org/turnstile-challenge?destination=/engine/items/citation/json/WOLF037299
```

Observed probes (`citation`, `brief`, `search`, `random`) all fail the same way: HTTP 200, `text/html`, kind `verification-page`. The client detects this and exits with an explicit error rather than saving HTML as JSON.

This is a technical research finding—not a reason to bypass access controls.

### Path to a successful request

1. Open a documented URL in a regular browser (for example the citation endpoint for `WOLF037299`) and complete the human-verification challenge.
2. Copy the resulting session cookie into local `.env` as `WOLFSONIAN_COOKIE=...` (see `.env.example`). Do not commit `.env`.
3. Re-run `npm run ping`, then `npm run item -- WOLF037299` or `npm run search -- --query "vase"`.
4. Confirm a timestamped packet appears under `data/raw/` (gitignored by default).
5. For sustained research, ask The Wolfsonian technical / Digital Labs team about an approved research route, export, or session workflow.

Until step 1–3 or an approved institutional path succeeds, `search`, `item`, and `seed` will keep reporting the verification page.

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

**Version 0.1.1:** endpoint mapping, provenance-first client, verification-page detection, CLI research scripts, offline URL tests, and documented live Turnstile finding.

| Milestone | State |
|---|---|
| Documented URL builders + offline tests | Done |
| Ping / search / item / seed CLIs | Done |
| Detect Turnstile instead of treating HTML as data | Done |
| First successful live JSON packet in `data/raw/` | Blocked on verification or approved research access |
| Roadmap 0.2 object-packet normalization | Next after live access works |
