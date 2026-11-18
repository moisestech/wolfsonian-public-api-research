# CURSOR MASTER PROMPT — Archive Dreams in Public
## Discoverable Lakehouse Object Society / Semantic Association / Evidence-First Interface
**Date:** November 18, 2026. **Artist:** Moises Sanabria.
**Repository:** https://github.com/moisestech/wolfsonian-public-api-research
**Baseline inspected:** main 481c6bea9968042f34cd732719b69c5364f51116 (fetch latest before working).
**Supporting research:** https://github.com/moisestech/wolfsonian-public-api-research/issues/71
**Full execution prompt:** An expanded local Markdown handoff has also been prepared for Cursor.

### Role / commission
Act as principal creative technologist, senior JavaScript and Three.js engineer, archival-search researcher, provenance and permissions engineer, accessible interaction designer and QA lead. **Implement code and tests in this existing repository**, using its existing graph, curated scenes and style system; do not stop with a plan. Work in reviewable small commits on a new feature branch.

> **Why was a connection proposed? What evidence supports it? Where does imagination begin?**

The independent artist-authored work is a society of collection *objects*, not a system of automated museum testimony. Silent objects and fully authored scenes must coexist. The artist's conceptual ARCHIVE, DREAM and BRAIN entry points are transparent visitor discovery lenses, not invented catalog keywords. Every permitted object should be findable by accession, title and typed text search whether or not it has an image, neighbor, or conversation. Arbitrary queries must work alongside the three seed concepts.

### Baseline audit — do before touching anything
1. Inspect git status, current branch, latest 12 commits, open PRs, and all active tests. Preserve uncommitted files and avoid force-push, cleaning, or unwarranted merges. Run existing tests, public build and the society census. Record the actual current counts.
2. Examine **src/discovery-graph.mjs** (private matrix parser, inverted tag index, rarity-weighted neighbor recommendations); **src/atlas-graph.mjs** (stable typed object/accession/theme/interpretation nodes and forbidden invented box maps); **src/lakehouse-matches.mjs** (bounded capture, semicolon-aware accession aliases, reconciliation); **src/archive-evidence.mjs**; **server/archive-services.mjs** and **api/archive-society/lakehouse.mjs**; **scripts/capture-lakehouse-sample.mjs**.
3. Examine **src/archive-society.mjs**, **src/conversation-orientation.mjs**, **src/curatorial-relationships.mjs**, **demo/archive-society/** (including **dream-field.mjs**), **demo/spatial-atlas/**, **demo/force-stage.mjs**, browser checks, public build allowlists and source-contract tests.
4. Carefully inspect open **PR #67** (persistent mobile Three.js atlas with draggable archive sheet) to avoid creating competing mobile state, panels, and layout. The latest merged #72 has print-dream terrain and scripted entrance choreography; **preserve these**.

### The actual data boundary
The staff working matrix contains 301 accession-identified records and four distinct namespace families: 21 themes, 46 motifs, 18 styles, 24 geographies. This is **not an approved public catalog**. There are 16,400 possible pairs sharing a broad theme, which is emphatically not 16,400 documented relationships. The existing artist-authored public preview is ~36 conversations and ~30 speaking objects, with public-record source packets separate from the matrix.

The user **has Lakehouse access**. Prior bounded internal lookup observed 76 accession matches in the first 4,000 rows; that does not establish total holdings, full join coverage, box identities or a supported accession-filter parameter. The known read-only public endpoint is https://lakehouse.wolfsonian.org/api/v1/aa_good_lookup. Do not call restricted internal endpoints. Do not assume live Vercel deployment is allowlisted just because an authorized local computer can reach the service.

### Stage P0: prove and document supported Lakehouse retrieval
From the user's authorized environment only, inspect the existing capture and server adapters, then make a read-only, bounded test on 1–5 *known public-packet accession values* (e.g., XX1990.1484, 86.17.1, XM1999.108.8 or 86.19.57), respecting the actual API contract. Learn the supported parameter names, paging/limit behavior, response format, accession/alias behavior, and field names from evidence, not guesses. If parameter details remain unclear, do not brute-force them; ask one concrete question and proceed with offline fixtures.

**server/archive-services.mjs deliberately requires** ARCHIVE_ENABLE_LAKEHOUSE=1, LAKEHOUSE_ACCESSION_PARAM, LAKEHOUSE_LIMIT_PARAM, and a private server access token. It refuses to guess parameter names. Preserve this architecture and do not put secrets or private requests into browser bundles, screenshots, GitHub issues or log files.

Build a safe normalizer for explicitly permitted JSON fields, preserving true source names, including accession aliases, title, creator, date, Subject, Description, geography, and only other fields truly returned. Keep null/missing fields, semicolon-delimited multiple accessions, duplicate candidates, uncertain reconciliation and source revision. Add bounded timeouts, output size and row caps, retrievedAt/hash, redacted errors and honest offline failure states. **Never fabricate a box-to-object mapping, collection image URL or museum citation.**

### Stage P1: one indexed discoverable graph
Extend current source modules; avoid parallel source-of-truth graphs. Build an accession-keyed ObjectRegistry containing **every approved/eligible record**, even isolated nodes with zero edges or no voice. Keep a distinct private registry for staff data. Give all eligible records search, filter, browse, accessible detail and stable encoded deep links.

Hybrid retrieval:
- **Exact identity:** primary/additional accession, title, creator, date; exact IDs dominate fuzzy matches.
- **Literal words:** field-aware BM25 or comparable deterministic ranking on approved title, Subject, Description and permitted packet text; display exact matched fields.
- **Vocabulary expansion:** explicit user-visible synonym rules. ARCHIVE -> memory, catalog, index, preservation, storage, absence. DREAM -> tomorrow, desire, future, utopia, projection, advertisement. BRAIN -> perception, signal, cognition, electricity, automation, learning, control. These are *artist-authored expansions*; offer “literal only,” and support any visitor query, not just preset terms.
- **Taxonomy:** private staff theme/motif/style/geography remain separate from Lakehouse Subject and are only indexed locally when permissioned. Use existing rarity weights.
- **Semantic meaning:** optional vector model over permitted text only, provider/version/content hash tracked. Prefer an approved local model; default OFF if permission or environment unclear. Keep a deterministic lexical fallback.
- **Critical counterpoint:** source-aware editorial tension (promise/labor, utopia/cost, efficiency/exclusion). Mark explicitly ARTIST_PROPOSAL, never historical fact.

Fuse bounded top-k candidates with interpretable ranking and diversity across media, eras and subjects. Expose only four-to-six strongest neighbors per focused object, plus at most one qualified counterpoint. Do not manufacture scores that imply probability of historical contact. Use cluster / level-of-detail view rather than drawing all metadata overlaps. Every indexed object must still be reachable by text search or browsing independently of the social graph.

### Stage P1: association receipt as the core interface
For any proposed link return structured fields equivalent to:
- sourceObjectId + targetObjectId and exact accessions
- method(s): exact, literal, lexical_expansion, taxonomy, semantic_candidate, artist_proposal or curated_scene
- why proposed: terms, field values, matched field names and visible contributor/expansion; no invented quotation
- provenance: source system, source locator where allowed, source/field revision and retrieval time
- historicalRelationship: documented, not_established or unresolved (documented only if independent evidence supports it)
- state: unreviewed candidate, artist curated, staff reviewed; **rights and publication state separately**
- model/provider/version only if a model actually contributed
- explanation to a lay visitor and link to **inspect original record**.

Present a persistent, readable evidence boundary:
**WHY THIS LINK? → WHAT IN THE RECORD? → WHAT IS AN INTERPRETATION?**
A conceptual match must *not* silently become a staff subject heading, historical contact, approved narrative or fully authored spoken line. Fictional archival voices are not statements by actual Wolfsonian staff.

### Stage P1: integrate with the present visitor UX
Use existing Society map, question cards, authored room transcripts, object stages, listen and record inspector; don't install another full frontend framework. Make Archive / Dream / Brain chips an optional starting state in the shared discovery UI, not three hard partitions. A node can appear under many concepts; concept-to-object associations must expose their basis.

- Desktop: zoomable Bosch-density private scene → one focused object → a few explained relations → cited record or authored question room.
- Mobile: preserve/share Three.js stage with a sliding sheet as in PR #67, with robust accessible list fallback; no 301 micro-tap targets.
- Silent object: still shows title, accession, description when approved, its source and what it doesn't know, and optional suggested neighbors.
- Authored room: only enter if pre-existing reviewed script; maintain question-led X Spaces-like discovery and WhatsApp-style transcript. Never auto-generate live dialogue masquerading as the existing script.
- Keep source evidence accessible, deep links stable, 320/390/768/1440 responsive states, reduced-motion, keyboard focus and current voice/playback safety.

### Stage P2: responsibly increase scope
Private performance trial: 301 corpus object nodes across an original three-territory **Memory / Projection / Consequence** landscape inspired by Bosch's simultaneity and micro-scenes, not a literal Bosch figure count or painting reproduction. Public view must filter to individually approved records and permitted representations.

Run 20 independently reviewed query/object-pair checks. Measure top-5 relevance, source traceability, permission correctness and a cold-visitor's ability to distinguish catalog fact vs AI/artist association. Compare semantic vs word+taxonomy retrieval before enabling vectors by default. Keep generated vectors out of public builds until appropriate authorization.

### Acceptance / release gates
- Exact accession selects its real eligible object; ambiguous and unknown accessions do not hallucinate identity.
- Every eligible index record is searchable, including 0-degree/unpictured/not-speaking nodes; run an automated reachability census.
- For ARCHIVE, DREAM and BRAIN show literal, expanded and semantic candidate states separately, with zero-literal example and no fabricated hits.
- 100% of proposed links disclose methods, field/source basis or a clearly labeled artist-only premise. 0 implicit historical contact claims.
- No private staff CSV, restricted source text, raw Lakehouse capture, private embeddings, image media or credentials emitted by public build. Add a regression test.
- Existing 36 authored rooms and stage transitions unchanged; run npm test, current npm run build:public, the public-society census and browser checks, plus low-end WebGL/reduced-motion fallback.
- Report actual data coverage, actual Lakehouse access status and any denied permissions; don't silently claim all 301 are joined or publishable.

### Implementation handoff
Make small reviewable commits on a new feat/discoverable-archive-society branch. Open a scoped PR with API contract observations (redacted), public/private visibility table, sample search output for Archive/Dream/Brain and arbitrary accession, a screenshot of “why this link,” performance/bundle guards, and exact test/CI results. **Do not deploy or merge without CI and source/rights review.**

Ask Moises at the first *actual* decision gate only for: (1) authorized lookup filter/limit example with no secrets if unavailable from approved docs; (2) whether any staff-matrix subset is cleared for public, default private; (3) local embedding policy, default off. Meanwhile complete deterministic indexed retrieval with fixtures.

**End state:** a richly inhabited but evidentially honest artificial society where *every permitted node can be discovered, not every node has to speak,* and every association can be examined.
