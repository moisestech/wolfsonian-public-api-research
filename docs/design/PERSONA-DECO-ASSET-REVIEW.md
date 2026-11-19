# Archive Society — Deco machine-mask persona family
Status: Cloudinary-first runtime integration proposed on a feature branch; not merged or deployed. The November 19 public-demo view needs QA before release.

## Cloudinary storage confirmed
- Aperture logos: `archive-dreams/brand/aperture-white-v1` and `archive-dreams/brand/aperture-black-v1`.
- New separate persona assets: **`archive-dreams/brand/personas/`**.
- Assets uploaded and verified: **44 persona SVG masters** (11 identities × 2 contrasts × full or compact), plus **3 white vectorized Deco machine-mask studies**.
- All SVG masters have transparent backgrounds. Cloudinary generates PNG deliveries at 512px for full, and 128px for compact. Mask studies have white PNG deliveries at 512px. Exact versioned URLs are in [persona-cloudinary-manifest.json](persona-cloudinary-manifest.json).
- An unapproved persona symbol is *not* a Wolfsonian logo and does not imply archive staff speaking.

## UI mapping
| App usage | Tested size | File treatment |
| --- | --- | --- |
| Desktop perspective selector | 28px | **compact**, central symbol only, high contrast |
| Mobile perspective choice | 42px | **full aperture**, white on dark / ink on light |
| Conversation avatar / role badge | 56px | full aperture only if label/role is explicit |
| Expanded persona portrait | 120px+ | full aperture plus name/question, not generic avatar |
| Brand header | 32–40px | keep the **original aperture logo**, do not replace with persona mask |

The three Art Deco mask studies are *family moodboards*, not three additional characters. They can guide future mask-like interpretation of the existing eleven interior pictograms while retaining unique functional reading perspectives.

## File naming
`<persona>-white-full-v1`, `<persona>-ink-full-v1`, `<persona>-white-compact-v1`, `<persona>-ink-compact-v1`.
For Deco studies: `deco-<mask>-white-v1`.

**White** = foreground on charcoal/dark backgrounds; **ink** = foreground on light paper backgrounds. The labels refer to glyph color, *not* the theme name.

## Implementation and release gates
The existing `personaAssetUrl(id,{tone,variant})` adapter uses the pinned Cloudinary manifest. The app's `portraitUrl()` defaults to those SVG masters, and `portraitFallbackUrl()` keeps the original inline SVG available on image errors. The primary Society UI already binds theme-aware full/compact images to its reader controls, participant plates and chat avatars; the mobile sheet intentionally remains a dark panel with white full-aperture marks. Discovery Lab uses compact icons. Spatial Atlas and Society's SVG graph add error fallbacks.

Before merging: run `npm test`, confirm `npm run build:public` continues to omit protected staff data, and visually inspect the 320px, 390px, and desktop sizes with light/dark modes, role labels, selection states and keyboard access. Check 28px compact mark legibility, 42px mobile full marks, and normal/CDN-blocked icon deliveries. Do not change the project header's original aperture logo.

Visual production remaining: the eleven shipped assets are aperture-derived *pictogram sigils*. The Family/Worker/Archivist nested-mask and profile studies may merit a future second visual pass, but they must be exported as their own isolated, transparent, contrast-paired character assets and explicitly reviewed before replacing the approved pinned IDs; do not substitute a composite moodboard sheet.

The `museum` persona remains a fictional stance; its UI needs a label that does not suggest institutional endorsement. Do not use any of these glyphs as evidence labels, catalog subject classifications or generation/reasoning indicators.
