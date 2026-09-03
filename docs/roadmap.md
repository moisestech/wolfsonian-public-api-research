# Initial roadmap

## 0.1 — Connectivity and provenance

- Validate documented endpoint URL construction.
- Detect machine-verification pages instead of saving HTML as JSON.
- Save raw records with retrieval timestamps and endpoint URLs.
- Build a small seed corpus from thematic searches.

**Status:** URL builders and verification detection are in place. Live automated requests currently receive Cloudflare Turnstile. CLI path remains available; simulation Track B does not depend on it.

## 0.2 — Object packets

- Normalize BibID, accession number, title, creator, date, material, format, subjects, and files.
- Track missing fields and record-level uncertainty.
- Add citation-ready source references.

**Status:** Dual-layer schema ships under `data/research-seeds/` (source) and `data/interpretations/` (derived). Live API-normalized packets remain blocked on connectivity.

## 0.3 — Research demo

- Select a few objects around labor, domestic modernity, propaganda, and technological optimism.
- Give agents bounded interpretive roles.
- Visualize agreement, contradiction, uncertainty, and source grounding.
- Produce a revision ledger for later onsite research.

**Status:** Trial 001 object deep-read remains available inside the simulation shell (record drill-down).

## 0.4 — Institutional memory simulation (Level 1)

- Capacity for 30 research seeds; Luna ship with 8 curated public-record packets.
- Deterministic institutional-memory graph (source vs interpreted edges).
- Precomputed interpretive rounds (Model A: documents as memory).
- View modes: Archive / Interpretation / Simulation / Contradictions / Unknown / Residency.
- Claim interrogation (not free chat).
- MiroFish as out-of-tree AGPL benchmark only (`experiments/mirofish/`).

**Status (2026-09-02):** Simulation 001 implemented on branch `feature/institutional-memory-v0`.

### External references (not dependencies)

| Level | Approach |
|---|---|
| 1 (now) | MiroFish-inspired architecture; our lightweight MIT engine |
| 2 (soon) | Run MiroFish locally as comparative research |
| 3 (later) | Evaluate OASIS (Apache-2.0) if persistent multi-agent runtime is needed |

Next corpus expansion: grow toward 30 seeds across utopia / media / machine ideology / world-making clusters (e.g. more Futurama/labor/colonial-adjacent public records).
