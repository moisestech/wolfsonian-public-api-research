# Roadmap

## 0.1 — Connectivity and provenance

CLI URL builders, verification-page detection, raw packet saving. Live Turnstile remains a Track A issue; Track B demo is independent.

## 0.2 — Object packets

Dual-layer schema: `data/public/objects/` (source) and `data/research/interpretations/` (derived).

## 0.3 — Research demo (object deep-read)

Bounded agents tableau preserved as record drill-down inside the simulation shell.

## 0.4 — Institutional memory / Research Demo 001

**Status:** implemented and merged to `main`.

- Featured 6 public records (capacity 30)
- Deterministic graph + 5 rounds
- Claim types: SOURCE_SUPPORTED / INFERENCE / UNCERTAIN / FABRICATION_TEST
- Residency mode + object-request candidates
- Stable Vercel demo
- Institution-safe gaps: `not_established_in_public_packet`
- MiroFish conceptual comparison only (no AGPL code)

## 0.5 — Day-One Living World Demo

**Target:** Monday, October 26, 2026.

**Status:** active pre-residency R&D.

The next phase does not replace Research Demo 001. It adds a second view of the same simulation state:

- **World View** — spatial, game-like, WebGL/PixiJS-oriented; records become places and agents become moving inhabitants.
- **Research View** — evidence, claims, provenance, contradictions, uncertainty, and Residency questions.

North-star interaction:

`WORLD → ENCOUNTER → CONVERSATION → CLAIM → EVIDENCE → RESIDENCY QUESTION`

Pre-residency work owns the artistic/interaction infrastructure. Institutional accuracy, approved internal data routes, rights, Lakehouse semantics, curation, and onsite corrections remain fellowship research inputs.

Full delivery plan: [`day-one-demo-roadmap.md`](day-one-demo-roadmap.md).

### Pre-residency milestones

| Window | Milestone |
|---|---|
| Sep 4–8 | Lock normalized contracts + `/world/` architecture + mock/public adapters |
| Sep 9–15 | World 0.1: Sparton vertical slice, 4 agents, one complete encounter |
| Sep 16–23 | Interaction legibility: selection, semantic zoom, bubbles, agent voices, evidence-vs-interpretation design |
| Sep 24–28 | Finish 12–16 interconnected preliminary collection requests |
| Sep 29–Oct 6 | World 0.2: 6 public records, 6 agents, multiple districts/encounters |
| Oct 7–14 | Adapter seam + 30-record mock stress corpus + privacy/rights safeguards |
| Oct 15–20 | Day-one 10–15 minute story, live demo, offline/video fallback |
| Oct 21–25 | Feature freeze, QA, rehearsal, digital-team/library question sets |
| Oct 26 | Demonstrate public-memory world and invite institutional data/context to revise it |

### External simulation references

| Level | Approach |
|---|---|
| 1 | Deterministic MIT engine — evaluation baseline |
| 2 | PixiJS/WebGL living-world renderer over the same state |
| 3 | MiroFish out-of-tree benchmark / possible OASIS evaluation after interaction grammar is stable |

## Institutional integration principle

Build to contracts, not Wolfsonian endpoints.

Source modes should eventually map into one normalized archival-record interface:

`MOCK / PUBLIC / INSTITUTIONAL / ONSITE → normalized record contract → same simulation + research views`

Do not ingest or publish non-public Lakehouse/internal material without explicit authorization and rights guidance.
