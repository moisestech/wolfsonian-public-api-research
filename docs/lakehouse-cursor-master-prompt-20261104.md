# Cursor master prompt — Wolfsonian Lakehouse

Source Google Doc: https://docs.google.com/document/d/1Z3-GHvoKeY2ag7C95KruKCHa8KtSb5LfOC5b4fl4cm8/edit

Run the bounded probe first: `node scripts/lakehouse-smoke-20261104.mjs`. Results are saved outside the repository in the OS temp directory.

# CURSOR MASTER PROMPT

_Archive Dreams in Public × Wolfsonian Lakehouse • Read-only connection and evidence separation • November 4, 2026_

## YOUR ROLE / MISSION

Act as a cautious full-stack research engineer and evidence designer working in moisestech/wolfsonian-public-api-research. Today's priority is to prove access to the new PUBLIC Wolfsonian Lakehouse API from this development machine and obtain dated, authentic JSON responses for four anchor objects. Do not turn this into a redesign, scrape, AI agent build, or production deployment. Preserve the original static BEFORE artwork as an inspectable control condition.

Read this entire brief, inspect git status/branches/current commit and repo instructions, then act autonomously on reversible research work only. Ask for human approval before any step that would alter main, production deploys, existing source packets, or public use of museum photographs. Stop and report if local uncommitted work would be overwritten.

## KNOWN CONTEXT — VERIFY, DO NOT ASSUME

GitHub: https://github.com/moisestech/wolfsonian-public-api-research ; last verified main 5d08bc8a6f79a5e3aa71829461fc79fb4a722757. Existing static /demo/ and presenter-guided /world/ are distinct. docs/living-world/FREEZE.md explicitly freezes the presentation-critical World and source packets. /research-console/ is a progressive-enhancement preview, not a real LLM or verified Lakehouse client.

Frozen public data: data/public/objects/WOLF-001..004.json ; simulation and interpretation layer data/research/ ; generated demo/data/ ; SVG illustrations. Preserve these byte-for-byte. Current deployed /demo/ is https://wolfsonian-research.vercel.app/demo/. It is an independent research demonstration, not an official museum app.

Andrius Aukstuolis (Digital Assets Project Manager) emailed Oct 27 that Lakehouse is PUBLIC, needs no token and allows cross-origin frontend fetch. Base https://lakehouse.wolfsonian.org ; docs https://lakehouse.wolfsonian.org/docs ; GET /api/v1/records?limit=...&offset=... ; GET /api/v1/records/{identifier} ; GET /api/v1/search?q=... ; GET /api/v1/aa_good_lookup (flattened). Limit: 100 requests/min/IP. Approximately 116k records from Proficio and Alma; reconciliation prioritizes museum record in overlaps because of photography coverage. Metadata includes creators_with_roles, exhibit_label/exhibit_title, field_subject, has_ocr/ocr_snippet. Public image URLs do NOT imply reproduction permission.

In this assistant's environment, public web and Python attempts could not resolve the hostname (DNS lookup failure before HTTP). That is environment-specific and must NOT be presented as proof that the API is down or private. Establish ground truth on this machine and if necessary during the 11 a.m. call with Andrius.

## P0 — PROVE DNS, HTTP AND FIRST REAL RECORD BEFORE ANY REFACTOR

1. Run `git status --short`, `git branch --show-current`, `git rev-parse HEAD`, inspect README, package.json, vercel.json, frozen docs, evidence log and existing research scripts. Preserve local changes. Never reset or force checkout.

2. Run diagnostics from the SAME computer/network that will execute the research: `nslookup lakehouse.wolfsonian.org` or `dig +short lakehouse.wolfsonian.org`; `curl -IL --max-time 15 https://lakehouse.wolfsonian.org/docs`; `curl -sS -D - --max-time 15 'https://lakehouse.wolfsonian.org/api/v1/records?limit=1&offset=0'` (redact sensitive headers in logs). Also inspect `https://lakehouse.wolfsonian.org/openapi.json` and the interactive Swagger UI if reachable.

3. Distinguish DNS lookup failure vs TLS/cert failure vs timeout vs 404 vs 403/WAF vs 429 vs HTTP 200 with unexpected HTML/JSON. Do not automatically substitute digital.wolfsonian.org; that is the older Turnstile-affected system, not the Lakehouse API. Do not bypass security gates, use proxy rotation or private credentials.

4. If terminal fails, inspect the domain in a normal browser and try one fetch in browser DevTools Console from a permitted context; report whether the browser connects and whether CORS succeeds. If DNS differs by network, record that and use another normal network only if authorized. Ask Andrius for working curl and the IP/hostname only if necessary.

5. Record a genuine success as: request URL, timestamp UTC, HTTP status 200, content-type application/json, response metadata and one sanitized JSON excerpt, and source-of-truth system. Do not call a connection successful merely because docs open or the static app builds.

## P1 — FOUR ANCHORS: EXACT LOOKUP, SEARCH FALLBACK, AND PROVENANCE

Anchors: WOLF-001 Trylon and Perisphere model: 86.17.1; WOLF-002 Sparton 558-C radio: XX1990.1484; WOLF-003 Machine Age Exposition catalogue: XM1999.108.8; WOLF-004 Mappemonde vase with lid: 85.7.383a,b. These identifiers are frozen public-packet values, not yet independently validated against live Lakehouse.

6. For each anchor, call exact `/api/v1/records/{encodeURIComponent(accession)}` once and collect result/HTTP status. If genuinely unmatched (404 or empty), make at most one narrow `/api/v1/search?q={encodeURIComponent(title fragment)}` search. Do not automatically treat first search result as the same object; record candidates and evidence.

7. Inspect actual response schema first rather than assuming shape. Capture live ID, accession variants, raw and normalized title, source source_system/Proficio/Alma fields, duplicate/merge identifiers, date, creator roles, museum vs library distinctions, exhibition title/label with attribution, field_subject, has_ocr/ocr_snippet, dimensions, media metadata and missing/empty fields. Unknown field paths should be marked UNKNOWN_SCHEMA, not invented.

8. Document cases where Proficio and Alma disagree or one version is suppressed by reconciliation. Separate raw values and normalized display fields. Never infer historical truth from the reconciliation winner or from has_image boosting in search. For each field, annotate PRESENT / NULL / NOT_RETURNED / AMBIGUOUS / CONFLICTING.

9. Save raw public API response bodies and a short manifest in a separate dated local research output outside the tracked repository, or a strictly gitignored temporary directory only after checking .gitignore. Include exact request URL, UTC time, status, SHA-256 hash, no cookies, no tokens, and no image downloads. Do not commit raw collection dumps or personal contact details.

## P2 — ADD A NON-DESTRUCTIVE LOCAL RESEARCH ADAPTER

10. Only after P0 success, add a small isolated Node.js v20+ script/adapter on a new branch (e.g. research/lakehouse-readonly-20261104) without changing package defaults, data/public/objects/, data/research/, demo/data/, /world/, /research-console/ or vercel.json. Use native fetch, AbortController, an explicit per-request delay >=900ms, maximum 12 total requests per run and rate-limit stop/backoff on 429. No bulk paginated harvest, crawling, scraping, image downloads or undisclosed network calls.

11. The adapter should return structured `{query, status, retrievedAt, raw, validation, error}` objects and a local README with reproducible commands. Name errors by layer (DNS, TLS, fetch, HTTP, JSON, schema, record identity). Print statuses and known matching fields only; never print huge raw bodies or expose credentials.

12. Include tests with local mock server or canned synthetic fixtures for 200 JSON, 404, HTML response, 429 and network failure. Synthetic fixtures must be labeled TEST ONLY and must NEVER masquerade as actual Wolfsonian API evidence.

13. Propose a clean interface `BEFORE static packet` versus `LAKEHOUSE observed snapshot` versus `HUMAN encounter/correction`, with explicit provenance/citations. Keep a documented mapping layer separate from frozen baseline and no auto-merge. Do NOT turn on live fetch in production or alter frontend visuals today.

## P3 — MEETING DELIVERABLE, HUMAN-IN-THE-LOOP

14. Prepare one-page table for Andrius with the four source identifiers, live exact-match result, possible alternate IDs, fields present/missing/conflicting, and questions. If every network call fails, present an honest connection diagnostic and precise one-command reproduction rather than fabricated matches.

15. Capture questions the response raises: source authority of metadata; stable IDs and collisions; exhibition label provenance/version; OCR semantics; Proficio/Alma conflict resolution; citation; API reliability/versioning; image license and credits; whom to ask for registrar/library/curatorial clarification; physical object access.

16. For rights: exclude collection image downloads and embedding until written rules or direct staff guidance. Default to existing original SVG representation. Publicly accessible metadata is not blanket licensing for museum images, private reports, dataset redistribution or LLM model training.

17. After call, maintain `CONFIRMED BY ANDRIUS`, `OBSERVED VIA API`, `INFERENCE`, and `NOT ESTABLISHED` as distinct statement types. Staff comments need attributable consent. Preserve an untouched BEFORE state so future AFTER corrections are auditable.

## NON-NEGOTIABLE ACCEPTANCE CRITERIA

A. At least one authentic Lakehouse API GET result with HTTP 200, date, actual raw JSON shape and URL, OR an unambiguous environment-level diagnosis and a minimal reproducible failing request. Never represent a blocked attempt as verified data.

B. All four anchor identifiers attempted carefully; report each as VERIFIED MATCH, POSSIBLE MATCH, NO MATCH, or CONNECTION FAILED. Preserve variant/suffix ambiguity.

C. Four-anchor research comparison contains sourced values, blanks marked explicitly, fields creators_with_roles, exhibit_label, field_subject, has_ocr, and original source system where available. Each claim cites request/field path and retrievedAt.

D. Git diff shows NO edits to frozen paths or deployed artifacts, no GitHub main push, no Vercel promotion, and no new unapproved museum imagery. `npm test` and `npm run build:demo` still pass where applicable; report commands and exact results, not assumptions.

E. Conclude with a short human handoff: connection outcome; canonical IDs or blockers; three biggest metadata discoveries; permission/rights questions; exact changed files/branch; actual tests; and suggested next action. A clean evidence report outranks a flashy demo.

## DO NOT DO

Do not silently normalize or rewrite frozen BEFORE packets, run a 116k-record harvest, exceed rate limits, scrape the separate old Turnstile site, use browser automation to bypass challenges, bundle museum photos, feed private or copyrighted collection material into an LLM, modify existing production deployment, invent fields or results, treat null as historical absence, or claim data use has been authorized beyond public read-only access.

## TODAY'S FASTEST OPERATOR HANDOFF

Start with P0 and send Moises the actual terminal output/diagnosis immediately. If reachable, complete one exact Sparton GET, then the other three and the comparison table before making any broader product decision. Use the Nov 4 Andrius meeting to resolve ambiguous source authority, license and catalog issues. Once connection is confirmed, propose a separate staged integration PR—but do not publish without review.

## REFERENCES

Andrius Oct 27 email, subject “Introduction to Creative Fellow Moises Sanabria”; `docs/living-world/FREEZE.md`; `docs/living-world/evidence/OFFLINE.md`; `data/public/objects/WOLF-001..004.json`; `docs/demo-methodology.md`; Drive meeting brief: https://docs.google.com/document/d/1hoMruWic87A3iyL8mgiXrq5ue0z56FL_UXtu03vOEgc/edit ; Lakehouse docs: https://lakehouse.wolfsonian.org/docs

