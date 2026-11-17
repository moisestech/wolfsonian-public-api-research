# Lakehouse read-only research adapter

Isolated Node.js client for `https://lakehouse.wolfsonian.org`.  
**Not** wired into `/world/`, `/demo/`, or `/research-console/`.  
**Not** a replacement for frozen `data/public/objects/` packets.  
Separate from `src/wolfsonian-api.mjs` (`digital.wolfsonian.org`).

## Reproducible commands

```bash
# From repo root — unit tests (TEST ONLY fixtures; no network)
npm --prefix research/lakehouse-readonly test

# Live probe (writes under .tmp/lakehouse-20261104/; gitignored)
npm --prefix research/lakehouse-readonly run probe

# Four frozen anchors (max 12 requests, ≥900ms delay)
npm --prefix research/lakehouse-readonly run anchors
```

Minimal curl (connection proof):

```bash
curl -sS -D - --max-time 20 \
  'https://lakehouse.wolfsonian.org/api/v1/records?limit=1&offset=0'
```

## Evidence rules

- `validation.verified === true` only for HTTP 200 + `application/json` parse success.
- Fixtures under `test/fixtures/` are labeled **TEST ONLY** and must never be cited as museum evidence.
- Raw live dumps go to `.tmp/lakehouse-20261104/` (gitignored). Do not commit collection dumps or images.
- Rate limit: stop on HTTP 429; do not harvest the ~116k corpus from this tool.

## Layers of error

`DNS` | `TLS` | `fetch` | `HTTP` | `JSON` | `schema` | `record_identity` | `rate_limit`
