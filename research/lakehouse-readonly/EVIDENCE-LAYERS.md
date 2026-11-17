# Evidence layers (proposed interface — no auto-merge)

Keep these three corpora separate. Do not silently rewrite frozen BEFORE packets from Lakehouse observations.

| Layer | Source of truth | Mutable? | Citation form |
| --- | --- | --- | --- |
| **BEFORE static packet** | `data/public/objects/WOLF-00N.json` (+ demo/world builds) | **No** (freeze) | Packet path + `citedAt` / prep note |
| **LAKEHOUSE observed snapshot** | Dated GET to `lakehouse.wolfsonian.org` with URL, UTC, status, body hash | Append-only research dumps under `.tmp/` | Request URL + `retrievedAt` + field path |
| **HUMAN encounter / correction** | Staff conversation, registrar/library/curatorial notes with attributable consent | Only with explicit human gate | `CONFIRMED BY ANDRIUS` / named staff + date |

## Statement types (post-call)

- `CONFIRMED BY ANDRIUS` — staff-attributed, consented
- `OBSERVED VIA API` — verified HTTP 200 JSON only
- `INFERENCE` — interpretive bridge; never promote to catalog fact
- `NOT ESTABLISHED` — missing from the cited source packet or API response

## Mapping layer

A future mapping document may relate frozen accession strings to Lakehouse identifiers.  
Until a verified 200 exists for an anchor, mapping status is **NOT ESTABLISHED**.  
No production frontend should live-fetch Lakehouse until a reviewed integration PR.
