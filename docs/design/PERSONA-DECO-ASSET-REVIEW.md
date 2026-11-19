# Archive Society — Deco machine-mask persona family
Status: design review; no runtime switching, no deployment.

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

## Implementation next step
Keep the existing app's portrait rendering stable until the 320px/390px/desktop UI is reviewed. Add a small `personaAsset(id,appearance,size)` adapter using this manifest. Prefer SVG for full-resolution scalable rendering, PNG only for integrations that require PNG. Keep text labels, semantic button names, visible selection and nonanimated fallback. Test contrast, role identity and 28px decipherability before merging.

The `museum` persona remains a fictional stance; its UI needs a label that does not suggest institutional endorsement. Do not use any of these glyphs as evidence labels, catalog subject classifications or generation/reasoning indicators.
