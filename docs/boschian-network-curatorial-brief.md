# Archive Dreams in Public — Boschian Network Curation (research branch)

**Prepared:** 2026-11-14 · **Presentation target:** Thursday, 2026-11-19 · **Status:** independent research proposal / internal presentation preparation, not institutional endorsement.

## Thesis

Build an explorable society from Wolfsonian objects, not a decorative force-directed graph. The Garden of Earthly Delights is a compositional reference: hundreds of figures, high horizon, interlocking vignettes, a movement between aspirational and disturbing futures. We do **not** reproduce Bosch's subjects or claim objects from the Wolfsonian literally belong to that painting. The critical difference from a discovery wall is that **every relationship has a reason, a source boundary, and a visible contradiction or question**.

## What the inputs actually are

1. **Six public packets already on main**: `data/public/objects/WOLF-001..006.json`. These are the existing verified public-record seeds for Trylon/Perisphere, Sparton radio, Machine Age Exposition catalogue, Mappemonde vase, In 1939 poster, and Your World of Tomorrow program. Their accompanying SVGs are *original diagrams*, not collection photography.
2. **Mark Osterman's staff-shared Objects at Scale Content Matrix (.xlsx)**: separate existing Discovery Wall spreadsheet supplied by email 2026-11-09. A local inspection found 301 populated accession-number rows, 21 thematic category options, 47 symbol/motif options, 19 visual strategies, 26 object-type options, and 3 unfilled forced-related-object slots per object (with matching category slots). These numbers describe the **shared workbook**, not the total Wolfsonian collection.
3. **Mark's methodology clarification (2026-11-10)**: actual Discovery Wall connections emerge from broad staff-selected categories/metadata, including secondary visible details. Its explicit relationship fields are deliberately unused, reserved for manually forced links; the Wall is a closed system and **not mapped to Lakehouse**.
4. **Andrius's public Lakehouse surface**: only `https://lakehouse.wolfsonian.org/api/v1/aa_good_lookup` is public. Authorized returned fields identified by Andrius: Accession Number, Resource Type, Title, ID (Node ID), Collection, Creator, Genre, Date, Geographic Origin, Subject, Description, Credit Line, Material, Extent, Media: Name, Additional Accession Numbers. Other routes like `/records`, `/search`, `/docs` are internal and must not be treated as public. We have **not verified live query syntax or a JSON result** in this session; do not pretend the 30 candidates were Lakehouse-fetched.
5. **Hannah's research links**: `https://fiu-flvc.primo.exlibrisgroup.com/nde/search?vid=01FALSC_FIU%3ANDE_FIUWOLF` (library); `https://digital.wolfsonian.org/` (digital catalog); `https://lakehouse.wolfsonian.org/`; `https://wolfsonian.org/research/library/` (physical library consultation); `https://wolfsonian.org/research/image-reproductions/` (reproduction permissions).

Do not commit the full staff workbook, interpretive captions, museum photographs, image filenames, source-email contents or downloaded assets to this public repo without explicit permission. The small title/accession shortlist in `candidates.json` is for identifying records; mark all 30 spreadsheet-derived items as unverified candidates until checked against a public catalog.

## Curated graph v0.1

- **36 objects**: 6 existing public anchor packets + 30 staff-matrix candidates.
- **22 candidate edges**: 9 metadata-based comparisons, 1 relationship bounded by existing public packets, 12 curatorial interpretations. None is an automatically authenticated historical causal link.
- **Three overlapping landscapes** (not a moral sorting of objects):
  - **The Promise**: architectures, exhibitions, electricity, technological improvement and the labor of making.
  - **The Seduction**: domesticity, commercial imagery, luxury, leisure, mobility, hospitality.
  - **The Consequences**: labor conditions, safety warnings, empire, propaganda and ideological claims.
- **Opening object**: Sparton 558-C, XX1990.1484. **Opening encounter**: radio + Philips Argenta electric light advertising + an industrial labor/safety poster, connecting elegant consumer interfaces to material infrastructures.
- **Central research object**: Machine Age Exposition catalogue, XM1999.108.8, to inspect physically through Hannah/library; do not substitute generated pages for original evidence.
- **Cross-zone pivot**: women's labor represented in an exhibition poster versus women represented in machine-safety instruction (both object titles/accessions present in matrix).

Data files: `data/research/boschian-network/candidates.json` and `relationships.json`.

## Graph data contract (proposed, not yet implemented)

```ts
type RecordNode = {
  id: string;                // e.g. record:WOLF-002 or matrix:87.4.28
  accession: string;         // preserved verbatim
  lakehouseNodeId?: string;   // only after successful public lookup
  sourceKind: "existing_verified_public_packet" | "candidate_from_staff_shared_object_at_scale_matrix";
  imageStatus: "original_svg_only" | "not_cleared" | "cleared_internal_display";
};
type Edge = {
  source: string; target: string;
  layer: "metadata" | "public_packet" | "interpretation" | "simulation";
  relation: string;
  basis: string;
  provenance: string;
  visitorQuestion: string;
};
```

Treat **staff matrix themes** and **Lakehouse Subject** as *different namespaces*. Do not copy tags into the authoritative Lakehouse fields. Join on the exact accession number first; support Additional Accession Numbers explicitly, record collisions and unresolved cases. Preserve institution-provided date strings and geographical qualifiers, including ambiguous years. Never infer missing provenance, catalog rights, social context, or documented historical causal links from proximity in a graph.

### Relationship rules

- **Solid, neutral lines**: documented public packet facts/identical accessions and explicit creator matches, with citation.
- **Fine parallel/paired lines**: metadata overlap from staff matrix, shown as shared tags, not facts of historical collaboration.
- **Dashed amber or visibly distinct paths**: curator-authored thematic tension; clicking must reveal the question and both objects' citations.
- **Animated dotted lines**: *simulated conversation only*, never recorded as evidence.
- **Ghost/open nodes**: missing record, missing image rights or unresolved equivalence; show why unknown.

Use link types and text labels, not colors alone, for legibility/accessibility.

### Edge selection for v1

Start with explicitly curated pairs in `relationships.json` and draw all metadata overlap edges only **on demand**. Later generate candidate neighbors deterministically:

`score = 4*creatorMatch + 3*sharedThemeCount + 2*sharedMotifCount + 1*sharedVisualStyle - 3*sameOnlyGenericTheme`

This score is a **navigation/relevance heuristic**, not a probability, truth score, or proof of causation. Never use it to silently promote `interpretation` to `public_packet`. Allow staff to override ranking as a *separate documented curatorial layer*.

## Art direction / diffusion image brief

Create an **original three-zone panoramic landscape** with intricate micro-scenes, a high horizon, surreal architectural stages, paths, water, arcades and mechanical infrastructure. Color/atmosphere moves from luminous promise through seductive saturated commercial color to smoky/ambiguous consequences. No text and no exact Bosch replicas. Reserve blank pockets for archival image placements and legible graph lines. Generate: (a) wide seamless background; (b) three independent zone mattes; (c) foreground foliage/architecture alpha overlays; (d) shadow masks/occlusion maps; (e) original icon silhouettes for assets with no authorized photography. Do not generate faux museum inventory images, provenance labels or false archival records. Actual collection photos require separate usage clearance.

Image projection: retain each Wolfsonian object in a bounded legible frame or approved cutout with title/accession and source badge; avoid blending generated background with the historical image such that the visitor cannot distinguish the two.

## Interactive grammar

**Far:** visitors see a Bosch-like landscape, inhabited but readable as three zones.

**Mid:** 12–18 featured objects render as active actors; other candidate objects appear as subdued silhouettes/placeholders with hover identity, no unsolicited voice.

**Near:** selecting Sparton opens 2–3 closest explainable paths (consumer light, industry, labor safety). One path produces a short contradiction: *Futurist* versus *Worker*. The **Archivist** acts as the evidence gate, not another chat bubble. Visitor can inspect cited source fields, see *not established*, and pose a question for onsite research.

**Audio:** any later ElevenLabs voices are explicitly AI-generated performances of authored interpretive lenses, not recorded historical voices. Default silent mode must remain fully usable.

**Layout:** seed 2D coordinates by zone (x = promise left, desire center, consequences right), then use restrained force simulation *within* zones; preserve authored sightlines, labels and 16:9 projection. Depth parallax on the background is atmospheric, not a substitute for graph semantics. Never let a large volume of visible edges obstruct archival images.

## Implementation boundary / next steps

1. Maintain current `/demo/` and `/world/` as production baselines. This branch is only research artifacts; **no runtime has been modified**.
2. Adapter follow-up: request one real public `aa_good_lookup` response in an authorized environment; document GET method/query parameters, response shape, item count/pagination, throttling and failure modes. Cache a small *permitted* record sample; do not crawl restricted endpoints or work around access controls.
3. Build standalone Mark taxonomy import locally and restricted to approved use. Normalize spelling/trailing spaces/duplicate countries without changing source labels. Track unknown accession matches.
4. Derive a normalized 36-object `graph-v0.json` from both feeds; each attribute stores `value`, `sourceId`, `retrievedAt`, `validationState`.
5. Render original layered scene with the 6 verified anchor SVGs first, then metadata placeholders; add image rights and actual catalog imagery only after approved access.
6. Add an edge inspector (shared tag / institutional fact / interpretation / simulated speech), accessible explanation, scene reset, and a tested offline fallback.
7. For Thursday Nov 19 show a **rehearsable vertical slice**, not an unverified 36-agent simulation. Success after 90 seconds: a fresh viewer identifies Sparton, sees why two objects were connected, distinguishes catalog data from a curatorial claim, and can open the underlying source.

### Institutional review questions

- Mark: Would you consider a non-forced object-to-object tag overlap the right analogue for `metadata`? Which tags are especially broad or intentionally provocative?
- Andrius: What exact public lookup request, batch size, pagination and object/media URL shapes are supported? Can we confirm a sample accession's additional IDs?
- Hannah/Amy/Luna: Which original objects/publications should be physically inspected, and what are the internal November 19 presentation image-use boundaries?

**Decision:** Prioritize the quality and inspectability of the first 20 edges over filling the screen with hundreds of undifferentiated lines. Scale should come from a reproducible ingestion pipeline, not hand-authored mythology.
