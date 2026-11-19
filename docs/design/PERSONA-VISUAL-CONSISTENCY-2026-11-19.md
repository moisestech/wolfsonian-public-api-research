# Archive Society — Persona visual consistency and handoff

**Working production audit: 2026-11-19.** Artist direction: monochrome architectural Art Deco faces/masks, aperture geometry, machine-age contours; figures must be legible as human-like character identities rather than generic pictograms. This is an artist-authored research/interpretation system, *not* institutional iconography or a museum-approved brand.

## Three distinct asset layers (do not conflate them)

1. **11 identity marks / 44 deployed SVG variants.** Every persona has precisely `white|ink × full|compact` with one coherent visual grammar and version-pinned Cloudinary URLs in [persona-cloudinary-manifest.json](./persona-cloudinary-manifest.json). PR #77 merged these to `main`. Use this as the **single stable icon language** on all persona controls, selection states, labels, tooltips and avatar-like small contexts; 28–42 px legibility is required. The illustrated gallery in PR #86 now overlays this same white identity mark on each large portrait.
2. **11 large character portraits (review branch).** Family, Worker and Archivist have previously artist-approved v2 designs. Tourist, Novice, Connoisseur, Futurist, Mourner, Propagandist, Counterfeit and Museum have **v4 sepia concept studies** uploaded and mapped to PR #86, but remain unapproved individual character images. UI temporarily desaturates these images to keep a monochrome palette; this does **not** imply their shapes have a consistent approved design or that a color filter has completed the art direction.
3. **5 artist-provided reference artwork files.** Four transparent mask/face designs (nested-family, architectural-deco, tiered-deco, halo-deco), each preserved as original plus 4 white/ink × full/compact derivatives (20 files), and a fifth very faint embossed three-figure JPEG preserved **as reference-only**. 21 Cloudinary assets at `archive-dreams/brand/personas/approved-masks`. Only nested-family has a confirmed Family visual association. **Never assign the other three masks to identities without artist confirmation.**

## Identity matrix

| Identity | Uniform v1 icon | Large portrait available | Artist status | UI role |
| --- | --- | --- | --- | --- |
| Family | yes, four versions | sepia v2; separate approved nested-family mask | prior v2 approved; new mask direction approved | active |
| Worker | yes, four versions | sepia v2 | prior v2 approved | active |
| Archivist | yes, four versions | sepia v2 | prior v2 approved | active |
| Tourist | yes, four versions | sepia v4 | study, needs art review | active |
| Futurist | yes, four versions | sepia v4 | study, needs art review | active |
| Novice | yes, four versions | sepia v4 | study, needs art review | additional lens |
| Connoisseur | yes, four versions | sepia v4 | study, needs art review | additional lens |
| Mourner | yes, four versions | sepia v4 | study, needs art review | additional lens |
| Propagandist | yes, four versions | sepia v4 | study, needs art review | critical, artist-authored |
| Counterfeit | yes, four versions | sepia v4 | study, needs art review | critical, artist-authored |
| Museum | yes, four versions | sepia v4 | study, needs art review | **fictional institutional lens**, never official museum staff or seal |

**Working gallery manifest:** [illustrated-persona-gallery-manifest.v1.json](./illustrated-persona-gallery-manifest.v1.json). **Production icon manifest:** [persona-cloudinary-manifest.json](./persona-cloudinary-manifest.json).

## Non-negotiable visual grammar for next approved characters

- Silhouette: symmetrical or near-symmetrical front-facing Art Deco mask, distinct forehead/eye/cheek/nose architecture, restrained geometric segmentation; meaningful persona-specific symbols integrated architecturally rather than pasted on.
- Shape: shared virtual circular/aperture framing, disciplined negative space, equal optical margin and visual weight; do not randomly switch between naturalistic portraits, animal mascots, photographic heads or flat emoji.
- Palette: a single transparent **white** version for dark app surfaces and opaque **ink** version for paper/light surfaces. No baked colored backgrounds or captions; warm/copper accent belongs to UI CSS, not persona artwork.
- Sizes: original scalable master preferred; exported `full` for portrait/cast (>=1024px PNG if raster) and optically simplified `compact` for 28–42px controls (>=256px raster). Avoid simply shrinking an intricate full portrait without hand-checking the compact details.
- Motion: selected-state rings and gentle opacity/position changes in UI, not looping animation baked into sources; honor reduced-motion preference.
- Accessibility: meaningful persona name and critical questions are **text**; decorative identity images have `alt=""`. Mark the fictional Museum perspective explicitly and never suggest a collection item or staff member is speaking authoritatively.
- Provenance: every new image needs origin, illustrator/generator method, Cloudinary public ID/version, variant names, rights status, approval status, and an Airtable record in **Moises Art OS → Archive Dreams — Persona Asset Pipeline**.
- Do not use source-restricted Wolfsonian collection photographs, internal APIs or catalog data as aesthetic-generative inputs without permission.

## Code integration and QA gates

- `src/persona-cloudinary-assets.mjs`: canonical version-pinned 11-sigil set and local SVG fallback.
- `src/persona-illustrated-gallery.mjs`: 11 large artist-directed artworks and 4 approved mask references, from the gallery manifest; do not use mask studies as speakers.
- `demo/archive-society/society.mjs`: render each large portrait plus shared white vector identity mark; desktop and mobile same persona IDs, names, questions and selected semantics.
- `demo/archive-society/society.css`: same optical size, position and contrast for each identity mark; temporary grayscale preview for sepia illustration studies.
- Tests: all 44 icon URLs match their manifest; all 11 gallery IDs exist; four approved mask studies remain non-speaking; mobile 390 screenshot and 11 identity marks; browser scripts pass. Check 320px/390px, desktop, light/dark, image fallbacks, absence of horizontal scroll, label contrast, no broken CDN.
- Production gate: review the eight v4 figures **against the artist-supplied four approved masks**; map the three unassigned studies only with artist direction; make a cohesive set of 11 final mask-based character illustrations; verify all 11 full and compact exports individually and only then upgrade portraits from review studies to approved. PR #86 is intentionally **draft**, not deployed.

## Verified review links

- GitHub [PR #77 (merged, v1 icons)](https://github.com/moisestech/wolfsonian-public-api-research/pull/77), [PR #86 (draft illustrated gallery)](https://github.com/moisestech/wolfsonian-public-api-research/pull/86).
- [Approved artist-uploaded assets and derivations](https://docs.google.com/document/d/1ek7DDfy4Hp7HuLwEyJ44YOQjLIyg3SIcVgTGjY9TLnI/edit).
- [Archive Dreams Visual Production Bible](https://docs.google.com/document/d/1gdW4-1BEX12EJrwQyfFBOVm8DNKZ0S5hnOTKs7q_3g8/edit).

**Key decision:** all **icons** are already a complete, consistent family; the illustrated **masks and portraits** are *not* yet eleven approved coherent faces. Maintain this distinction in GitHub, Cloudinary and Airtable.
