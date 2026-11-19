# Architectural persona audit — November 19, 2026

The approved visual language is not yet complete across eleven identities. Upload counts and passing software checks do not establish artwork approval.

## Verified sources

The four current user-supplied PNG references were downloaded from Library and compared as decoded RGBA pixels against Cloudinary's four approved-mask originals: all four comparisons have mean absolute difference 0. Different PNG byte sizes reflect encoding, not a different design. The fifth JPEG is retained as a reference-only triptych.

All 21 assets in `archive-dreams/brand/personas/approved-masks` now carry explicit approval/usage tags and context. Four designs have original + white/ink × full/compact versions. The JPEG is reference-only. No duplicate upload is needed.

## Current identity status

| Identity | Current preview | Remaining |
| --- | --- | --- |
| Family | Approved nested-family mask, now wired to both palettes and sizes | Mobile and desktop visual acceptance |
| Tourist | Flat geometric v1 study | Evaluate existing limestone v2 prototype; final artist approval |
| Novice | Flat geometric v1 study | Sculptural architectural redesign |
| Connoisseur | Flat geometric v1 study | Sculptural architectural redesign |
| Worker | Earlier v2 illustrated portrait | Match approved mask language |
| Archivist | Earlier v2 illustrated portrait | Match approved mask language |
| Futurist | Flat geometric v1 study | Sculptural architectural redesign |
| Mourner | Flat geometric v1 study | Sculptural architectural redesign |
| Propagandist | Flat geometric v1 study | Sculptural architectural redesign |
| Counterfeit | Flat geometric v1 study | Sculptural architectural redesign |
| Museum | Flat geometric v1 study | Sculptural architectural redesign |

The architectural-deco, tiered-deco and halo-deco artworks are artist-approved designs with no confirmed speaking-identity assignments. Keep them visible as reference studies until their mappings are settled. Family is the sole approved mask with a confirmed identity mapping.

## Existing unconnected Tourist prototype

![Tourist limestone prototype](https://res.cloudinary.com/dck5rzi4h/image/upload/v1795122756/archive-dreams/brand/personas/architectural-masks-v2/tourist-limestone-full-v2.png)

This raster prototype was already uploaded to Cloudinary but was not connected to the gallery. It is a candidate, not an approved final design. Preserve it without silently replacing the active character.

## What changed in this audit

- Family now uses the supplied nested-family mask instead of the earlier sepia illustration.
- Exact existing white/ink URLs and full/compact URLs are reused; previous Family art remains recorded for rollback.
- Cloudinary records distinguish approved artwork, unassigned artwork and reference-only imagery.
- No claim that the 44 earlier SVG symbols or the eight flat geometric studies complete the approved architectural portrait language.

## Release status

Gallery work remains in PR #86, separate from main. Prior head `382261ea698aa2f29057d120b762d3ab3514e4af` had successful verify and source-contract checks. This audit changes that head; validate the updated code before release. A complete set still requires ten final identity designs/mappings and visual checks in the actual mobile and desktop picker.


## Validation and concurrent branch updates

- Local candidate: `node --test test/*.test.mjs`: 154 passed, 0 failed. The remote branch advanced concurrently with equivalent Family wiring and additional fallback fixes; this count does not validate that newer remote head.
- `git diff --check`: passed.
- Added an assertion that the desktop Family picker requests the approved mask.
- Browser screenshot validation could not run locally: bundled Chromium download returned HTTP 403 and system Chromium could not create its singleton socket in this execution environment. Full `npm test` therefore had one browser-launch failure, with the other 154 tests passing. Browser QA and current-head CI remain outstanding.
