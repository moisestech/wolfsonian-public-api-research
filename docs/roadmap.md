# Initial roadmap

## 0.1 — Connectivity and provenance

CLI URL builders, verification-page detection, raw packet saving. Live Turnstile remains a Track A issue; Track B demo is independent.

## 0.2 — Object packets

Dual-layer schema: `data/public/objects/` (source) and `data/research/interpretations/` (derived).

## 0.3 — Research demo (object deep-read)

Bounded agents tableau preserved as record drill-down inside the simulation shell.

## 0.4 — Institutional memory / Research Demo 001

**Status:** Implemented on `feature/research-simulation-demo`.

- Featured 6 public records (capacity 30)
- Deterministic graph + 5 rounds
- Claim types: SOURCE_SUPPORTED / INFERENCE / UNCERTAIN / FABRICATION_TEST
- Residency mode + object-request candidates
- Vercel static config for stable share URL; Pages workflow optional
- Institution-safe gaps: `not_established_in_public_packet`
- MiroFish conceptual comparison only (no AGPL code)

### External references

| Level | Approach |
|---|---|
| 1 (now) | Deterministic MIT engine |
| 2 | MiroFish out-of-tree benchmark |
| 3 | Possible OASIS evaluation later |

Next: share Luna URL via Vercel; expand corpus toward 30 only after onsite feedback; optional generative agents against this audited baseline.
