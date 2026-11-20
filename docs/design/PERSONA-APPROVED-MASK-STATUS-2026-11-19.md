# Archive Society — approved architectural-mask implementation audit
**Reviewed November 19, 2026.** This document distinguishes uploaded imagery, code-level integration, artistic acceptance and public deployment. No museum endorsement is implied. The fictional Museum lens must remain explicitly labeled.

## Release status

- **Production main:** all 11 legacy aperture-derived white/ink SVG identity marks are present; they are **not** the newly approved architectural-mask visual system.
- **Draft PR [#86](https://github.com/moisestech/wolfsonian-public-api-research/pull/86):** responsive large-illustration gallery for all 11 perspectives, using hosted image URLs. Still **not merged / not production deployed**.
- **Cloudinary approved-reference folder:** `archive-dreams/brand/personas/approved-masks` contains 4 original transparent mask artworks, 16 white/ink full/compact derivatives, and 1 ultra-faint embossed three-figure reference JPEG — **21 files**. Exact URLs are in `illustrated-persona-gallery-manifest.v1.json` under `masks` and `referenceOnly`.
- **This audit update:** **Nested Family** is now the actual large Family portrait in PR #86 (all four version-pinned PNG variants), rather than merely an unused reference section. The earlier sepia Family image is preserved in `priorIllustration`.
- **Additional Cloudinary candidates:** 8 independently named *flat geometric* masks, 16 SVG masters with 32 derived PNG URLs in `architectural-masks-v1`, all still **artist review pending**. A later `architectural-masks-v2/tourist-limestone-full-v2` independent raster study exists but has not been accepted or inserted into the main gallery. Do not describe these as final bas-relief illustrations.

## Identity-level acceptance inventory

| Interpretive identity | Current PR #86 primary artwork | Artistic status | Remaining |
| --- | --- | --- | --- |
| **Family** | Approved `nested-family` full/compact white/ink mask | Artist-approved reference, correct Family relationship; mobile QA pending | Check contrast, scale and crop in live picker |
| Worker | Earlier sepia v2 character portrait | Previously accepted artwork; not yet equivalent to the approved new mask grammar | New dimensional architectural mask; review both sizes |
| Archivist | Earlier sepia v2 character portrait | Previously accepted artwork; not yet harmonized | New dimensional mask; review both sizes |
| Tourist | Flat architectural-mask v1 PNG; additional v2 limestone study in Cloudinary | Not individually approved | Review v2 as a separate candidate, then final relief artwork + paired exports |
| Novice | Flat architectural-mask v1 PNG | Artist review pending | Distinct individual bas-relief face + exports |
| Connoisseur | Flat architectural-mask v1 PNG | Artist review pending | Distinct individual bas-relief face + exports |
| Futurist | Flat architectural-mask v1 PNG | Artist review pending | Distinct individual bas-relief face + exports |
| Mourner | Flat architectural-mask v1 PNG | Artist review pending | Distinct individual bas-relief face + exports |
| Propagandist | Flat architectural-mask v1 PNG | Artist review pending | Distinct individual bas-relief face + exports |
| Counterfeit | Flat architectural-mask v1 PNG | Artist review pending | Distinct individual bas-relief face + exports |
| Museum (fictional) | Flat architectural-mask v1 PNG | Artist review pending | Distinct artist-authored fictional institution face; never imply staff voice |

### Approved inputs: identity association

1. **Nested Family:** directly mapped to Family, now active in the draft gallery.
2. **Architectural Deco:** artist-approved style reference only; no persona assigned.
3. **Tiered Deco:** artist-approved style reference only; no persona assigned.
4. **Halo Deco:** artist-approved style reference only; no persona assigned.
5. **Three-figure embossed JPG:** very low-contrast moodboard; **reference-only**, never a visitor avatar or small icon.

Cloudinary originals now have explicit tags/context for artist-supplied provenance, approval as visual references, known or unknown identity relation, and distinction from museum branding.

## What “done” means

| Layer | Progress | Definition |
| --- | --- | --- |
| Persona definitions | **11/11** | Existing coherent lens IDs, names and critical questions |
| Legacy utility marks | **11/11** | 44 versioned SVGs available on main; intentionally not equated to the new finished faces |
| Artist-supplied reference preservation | **5/5** | All five saved, 20 original + derivatives for four masks plus one JPG |
| Illustrated gallery with functioning URLs | **11/11 in draft** | Accessible PR #86; not merged |
| Approved new mask used for named identity | **1/11 (Family)** | One justified direct mapping; three references intentionally unassigned |
| Final approved cohesive 11-mask portrait family | **1/11 mapped, 10 need art-direction pass** | Older accepted portraits and eight flat concepts do not yet share the approved mask grammar |
| Production publication | **Not complete** | PR #86 still draft; mobile/desktop QA + user art acceptance required |

## Production order

1. Review the installed **Nested Family** image on 320px, 390px and desktop in both themes; verify no blank transparent-on-same-color rendering and that the text remains legible.
2. Use the four approved masks as the single *visual-language reference*, not as generic interchangeable icons. Draw 10 remaining distinct masks in standalone image-generation/artist production passes; start with Worker, Archivist and Tourist, then proceed in groups of three or four. Do not convert older SVG geometry into pretend bas-relief.
3. For each identity, store a high-resolution transparent master and independently verified white/ink × full/compact output, Cloudinary IDs/versions, provenance, approval state, and mapped exact URL.
4. QA all assets at icon scale and large gallery scale, keyboard and touch selection, light/dark, and image network failure. Run full tests/build on **latest branch SHA**.
5. Obtain artwork signoff for each identity, then merge PR #86 and confirm app deployment. Keep unapproved candidates accessible as studies until then.

**Source of truth:** [PR #86](https://github.com/moisestech/wolfsonian-public-api-research/pull/86), [gallery manifest](./illustrated-persona-gallery-manifest.v1.json), [visual review board](./PERSONA-VISUAL-BOARD.md), [visual consistency criteria](./PERSONA-VISUAL-CONSISTENCY-2026-11-19.md).
