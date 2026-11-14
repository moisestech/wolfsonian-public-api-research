# Discovery Lab 002 — Explainable metadata navigation

An **independent, artist-authored research prototype** beside (not replacing) Research Demo 001.

## Why this was built

Mark Osterman described *Object at Scale / Discovery Wall* connections as broad staff-assigned metadata overlap, deliberately enabling unexpected exploration. The supplied working Excel file uses:

- Geography (one slot)
- Visual Strategy/Style (one slot)
- Thematic Category 1/2/3
- Symbols/Motifs 1/2
- Related Object 1/2/3 and Related Category 1/2/3 (**all empty** in the November 9 matrix copy)

The separate Wall has no current integration with Lakehouse. A shared category is **not proof of historical influence, curatorial approval, or factual causation**.

An audit of the supplied matrix found 301 valid objects, 21 thematic values, 46 motif values, 18 style values, and 24 geography values. There are 16,400 possible unordered object pairs sharing at least one theme, so drawing every edge creates a meaningless hairball.

## Implementation

- `src/discovery-graph.mjs` — deterministic RFC4180 CSV parsing; finds the real header after instruction rows; drops section headings; preserves exact category-column provenance; local inverted tag index; metadata-only connection scoring; transparency-first personas
- `demo/discovery-lab/` — browser-only import and SVG neighborhood graph (6 suggestions), inspector showing all overlapping tags, research-question and blind-spot disclosure
- `test/discovery-graph.test.mjs` — parsing, quoted multi-line fields, valid object-row filtering, provenance, false historical-link prevention, persona ranking, duplicate IDs
- Original `/demo/` simulation, source packets and frozen BEFORE state remain functionally untouched; the demo landing has only a navigation link to the separate Lab.

## How to use

1. Open `/demo/discovery-lab/` (locally or on a *review* deployment).
2. Try the explicitly **invented example records** to learn the controls. They are not sourced from Mark or the museum.
3. In your own Google Sheet or Excel, **export the exact Object at Scale tab to CSV** (Excel `.xlsx` is not read directly in this browser prototype).
4. Choose the CSV file in the page. JavaScript processes the bytes on your current device; **no network POST, upload endpoint, external LLM or third-party asset service** is used for this file. The input is not stored or added to GitHub.
5. Select a starting object and compare the *Family, Tourist, Art connoisseur, Worker, Futurist, Archivist, Mourner,* and *Propagandist* interpretive lenses.
6. Select edges to inspect which precise staff fields gave rise to them; click a node to move the origin.

An image filename does **not** provide reproduction permission. The prototype deliberately displays no privately sourced TIFFs or museum collection images.

## Semantics and safety

- `shared_staff_metadata` = a computed candidate connection, derived from identical strings in matched columns.
- The response `historicalRelationshipEstablished=false` is intentionally fixed for all metadata-only edges.
- Scores are deterministic ranking conveniences, **not confidence in historical evidence**.
- Staff-curated/direct edges are reserved for later, but the six "Related" fields in this copy have no populated links. Do not invent them.
- No Lakehouse access, box-number access, API integration, or rights to publish the museum spreadsheet are implied.
- Archetypes are transparent *fictional reading protocols*, not demographic profiling or actual historical persons. Their field preferences and epistemic limits appear in the UI.
- Museum source content is not used as LLM prompt context here. Consider public image/source permissions before any deployed real-data example.
- Keep the local CSV private; when demonstrating the branch to staff, use the invented sample until a limited approved object subset exists.

## Recommended next iterations

1. **Staff-authorized 12–24 object sample** with legitimate low-resolution images, exact license, accession source and editable credits.
2. **Bipartite tag nodes:** `object → thematic/motif/style tag → object` instead of opaque pairwise edges.
3. **Diversity control:** balance obvious and surprising connections without claiming a relationship.
4. **Evidence overlay:** approved historical citations, curatorial direct links and machine inference as *distinct* edge classes, with an event-sourced evidence ledger.
5. **Archetype debate:** show two or three voices explaining their selection, admitting blindness, and asking a falsifiable onsite question. Use rules and citations before any probabilistic agent generation.
6. **Lakehouse reconciliation:** only through approved access, with accession and box identifiers kept distinct from Discovery Wall tags.

## Acceptance checklist

- [ ] `node --test test/discovery-graph.test.mjs`
- [ ] `npm test`
- [ ] Manually open the invented sample and click a path + switch persona.
- [ ] Import a private CSV locally. Confirm no network upload in browser DevTools.
- [ ] Verify all 301 objects load; verify 0 direct curated relations derived.
- [ ] Confirm keyboard accessible graph nodes, selection, and readable inspector.
- [ ] Confirm original `/demo/` and `/world/` still behave identically.
- [ ] No screenshot, working matrix or photo published without permissions.

**Sources:** Mark's November 9 and November 10 emails; privately supplied Object at Scale Content Matrix (not reproduced in the repo); internal artist matrix audit dated November 14, 2026.
