# Lakehouse connection brief for Andrius — 2026-11-04

**From:** Moises Sanabria / Cursor research pass  
**API host:** `https://lakehouse.wolfsonian.org`  
**Client public IP (this laptop):** `73.1.123.236`  
**Probe UTC:** `2026-11-04T14:25:42Z`  
**Repo `origin/main`:** `5d08bc8a6f79a5e3aa71829461fc79fb4a722757`

## Connection outcome

| Check | Result |
| --- | --- |
| DNS | PASS — CNAME `web.wolfson.fiu.edu` → `131.94.106.86` |
| TLS / HTTP/2 | PASS |
| `GET /docs`, `/openapi.json`, `/api/v1/records?limit=1` | **HTTP 403** body: `Forbidden: IP not authorized` (IIS + ARR) |
| Authentic catalog JSON retrieved | **No** |

**Minimal reproduction:**

```bash
curl -sS -D - --max-time 20 \
  'https://lakehouse.wolfsonian.org/api/v1/records?limit=1&offset=0'
```

Oct 27 email said Lakehouse is public / no token / CORS OK. This machine reaches the host but is rejected by IP allowlisting. Please clarify whether “public” means (a) no API key on allowlisted networks, or (b) open to any internet IP — and how to authorize `73.1.123.236` (or campus VPN / FIU ARR rule).

## Four frozen anchors (no invented matches)

Frozen packet values only. Live status today: **CONNECTION FAILED** for all four (shared 403). After the healthcheck 403, the research CLI still issued one exact `GET /api/v1/records/{accession}` per anchor (4 requests, ≥900ms delay); each returned the same IP-allowlist 403 — **not** catalog JSON. No search fallbacks were run (exact miss was not a 404).

| Seed | Frozen accession | Title fragment | Exact match | Alternate IDs | creators_with_roles | exhibit_label / title | field_subject | has_ocr / ocr_snippet | source_system |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WOLF-001 | `86.17.1` | Trylon and Perisphere | CONNECTION FAILED | — | NOT_RETURNED | NOT_RETURNED | NOT_RETURNED | NOT_RETURNED | NOT_RETURNED |
| WOLF-002 | `XX1990.1484` | Sparton 558-C | CONNECTION FAILED | — | NOT_RETURNED | NOT_RETURNED | NOT_RETURNED | NOT_RETURNED | NOT_RETURNED |
| WOLF-003 | `XM1999.108.8` | Machine Age Exposition | CONNECTION FAILED | — | NOT_RETURNED | NOT_RETURNED | NOT_RETURNED | NOT_RETURNED | NOT_RETURNED |
| WOLF-004 | `85.7.383a,b` | Mappemonde | CONNECTION FAILED | — | NOT_RETURNED | NOT_RETURNED | NOT_RETURNED | NOT_RETURNED | NOT_RETURNED |

Suffix / variant ambiguity (e.g. `85.7.383a,b`) will be preserved; first search hit will not be auto-accepted as the same object.

## Questions for staff

1. **Source authority:** When Proficio and Alma disagree, which system wins for which field classes, and is the loser still queryable?
2. **Stable IDs:** What is the canonical Lakehouse identifier vs accession vs BibID? Collision / merge policy?
3. **Exhibition text:** Provenance and versioning of `exhibit_label` / `exhibit_title` — who authored, when frozen?
4. **OCR:** Semantics of `has_ocr` / `ocr_snippet` — full text rights? Research-only?
5. **Citation:** Preferred citation string for a Lakehouse record retrieved on date X?
6. **Reliability / versioning:** OpenAPI stability; changelog; deprecation contact?
7. **Images:** Public image URL ≠ reproduction permission — written rules for fellows? Default remains original SVG in our demo.
8. **Contacts:** Whom to ask for registrar vs library vs curatorial clarification?
9. **Physical access:** Oct 26 intro ≠ collection access; what is the path for object viewing under fellowship clearance?

## Statement taxonomy (after this call)

Use explicitly: `CONFIRMED BY ANDRIUS` | `OBSERVED VIA API` | `INFERENCE` | `NOT ESTABLISHED`.

## Local research tooling (no production deploy)

Branch `research/lakehouse-readonly-20261104` adds `research/lakehouse-readonly/` (mock-tested adapter). Frozen `data/public/objects/`, `/world/`, `/demo/` untouched. No museum photographs downloaded.
