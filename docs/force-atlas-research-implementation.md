# Force Atlas — the archive as a researchable, navigable artificial society
**November 16, 2026 · independent artist research · draft PR #21**

## The compounding move
One normalized evidence graph powers the existing 2D map, the 3D spatial view, the mobile Object Lens, the inspector, and (later) a source-bounded multi-perspective conversation. Rendering is a consumer of meaning, not an alternative truth store. We do not need a second database or a Neo4j server for this phase.

The cited [three-forcegraph](https://github.com/vasturiano/three-forcegraph) package provides a configurable Three.js scene object that calls `tickFrame()` during rendering. The [Neo4j/WebGL article](https://medium.com/neo4j/visualizing-graphs-in-3d-with-webgl-9adaaff6fe43) demonstrates incremental node/edge loading and a higher-level 3d-force-graph wrapper, not a reason to migrate the museum catalog into Neo4j.

## What this draft branch adds now
- `src/force-atlas-data.mjs`: consumes current `src/atlas-graph.mjs`, separates six existing public-packet object identities, their accession nodes, artist-authored question edges, and optional verified box association edges (NONE loaded). The adapter is a bounded, deterministic interface to `{nodes,links}`.
- `/demo/spatial-atlas/force/`: 3D WebGL view that starts with Sparton `XX1990.1484`, retains 2D fallback and links to both Conversational Atlas and Object Lens. It shows source state and exact accession labels, uses a calm paper/charcoal/teal/copper art direction, allows orbit/zoom/picking and reveals question/evidence. An offline static Three.js layout is retained when the optional pinned online `three-forcegraph@1.43.6` script cannot load; this DOES NOT yet make force physics available offline.
- `test/force-atlas-data.test.mjs`: identity, visible layers, unknown box, source immutability, accession punctuation and question provenance.
- No museum photos, full Mark matrix, additional internal API route, staff-only storage identifiers, or Lakehouse response bulk stream.

## Art direction and interpretation
Start with ONE object rather than an overwhelming cosmos. Use the Sparton radio as the domestic anchor; compare it to the Machine Age catalogue and Trylon/Perisphere using clearly labeled questions, NOT claims that makers or histories intersected. The 1939 fair poster and program expand the representation of future-making and advertising. Museum packet identity is distinct from an exact live Lakehouse match.

A visitor should make four independent decisions:
1. **Object** — select an actual record/title and see its accession, data origin and limitations.
2. **Link** — read whether a line is a primary/additional accession, verified physical box membership, staff metadata, published source fact, or ARTIST QUESTION. Never equate a common tag with a causal historic relationship.
3. **Reader** — try Family, Worker, Futurist, Archivist etc. The reader changes interpretations/ranking, not source records.
4. **Evidence** — inspect the precise basis, discuss unknowns, return to real archival material or an object at the museum.

Three-dimensional distance, physical clustering, centrality, or spring strength are visual design outputs, NOT archival confidence scores. Never use unlabeled color, size, or particle flow to imply source truth.

## Engineering decision
**Current experiment:** keep stable main unchanged. Reuse already installed Three.js 0.170 locally, load optional `three-forcegraph@1.43.6` from pinned CDN only after the local 3D fallback works; the 2D Atlas is the reliable baseline. No new npm lock change has been made in this review PR. The local Node server explicitly serves only approved static modules and binds to 127.0.0.1.

**Before shipping fully offline / to production:** add `three-forcegraph@1.43.6` as a pinned npm dependency, update and commit `package-lock.json` using `npm ci` / install on a networked workstation, bundle the Three scene and library together with a reproducible build (no CDN at runtime), test actual WebGL/camera and forced layout on the presentation laptop and iOS, and keep existing 2D map as accessible fallback. Do not claim CDN availability equals an offline feature.

**Before exposing more real objects:** verify publication rights for the 300 staff-matrix-derived records already in the public repository; do not add more there without permission. Mark explicitly said the Discovery Wall is a closed, separate system whose shared metadata relationships are not Lakehouse facts. The working matrix has zero explicit Related Object/Category links. Keep the full matrix and photographs private until expressly cleared.

**Before enabling Lakehouse:** Andrius authorized the single public `aa_good_lookup` endpoint and published a 16-field subset, but a user-reported unfiltered onsite GET on November 16 streamed the collection. The partial response was not saved and exposed no box field in the observed prefix. Obtain an approved exact-accession parameter and hard five-row-limit parameter before ANY further call; keep current disabled-by-default proxy with 512 KiB cap and identity checking. Storage/box join paths and display permission remain unknown.

## Deliberately incremental acceptance gates
- **P0 (this PR):** six public anchors; ten visible connections when accession and questions on (six identity and four interpretive); no fake box; toggles independent; artist/source labels unambiguous. Unit-testable without the museum network.
- **P1 (laptop rehearsal):** camera orbit/zoom/picking, inspect questions, optional force engine/fallback, mobile layout, 2D keyboard fallback. Real browser screenshots and test results are still required.
- **P2 (source activation):** one complete, bounded, permitted real Lakehouse record joins an existing accession by exact primary value; record snapshots/field pointers remain separate from artist questions.
- **P3 (world):** 24-item neighborhood where 3D composition takes after Bosch's simultaneity (NOT invented representations of museum artifacts), contextual discussion voices, local permitted images with exact credit, validated object-lens handoff; only after real data/rights gates.
- **P4 (institutional feedback):** Mark/Amy/Hannah/Andrius can annotate provenance and correct an artist hypothesis; version interpretation before/after instead of silently mutating the archive.

## 90-second walkthrough
0–20 seconds: Sparton center; accession node ON; identify it as a manually prepared public packet, not a live API match.
20–40: Artist question connects to Machine Age catalogue. Open the inspector: the line is a **question**, not historical evidence.
40–60: Select Trylon. Show question about fair publicity and tomorrow; maintain exact accessions. Distances in space signify no institutional facts.
60–75: Turn box ON. The application displays **no authorized mapping loaded**, with zero box edges.
75–90: Open the existing 2D Atlas and Object Lens links to demonstrate that the same object identity survives across experiences.

## Known blockers
- Force physics currently requires a pinned online third-party script. Offline **3D fallback** exists but does not simulate forces.
- Browser runtime and production deployment not verified from this editing environment.
- The public dataset authorization of staff-matrix metadata in `src/matrix-objects.mjs` needs an explicit institutional review. This PR does not reference that module.
- The separate GitHub Pages `main` workflow recently failed because the Playwright test file ran before dependencies were installed. That pre-existing deployment issue is outside the 3D view, but must be resolved for a full release.
