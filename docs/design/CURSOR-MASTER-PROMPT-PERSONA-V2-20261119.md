# Cursor master prompt — Archive Dreams in Public / Persona v2 portraits
**Date:** November 19, 2026 · **Type:** implementation handoff / artist review gate · **Tracker:** [Issue #79](https://github.com/moisestech/wolfsonian-public-api-research/issues/79)

You are operating as the senior visual-systems engineer and creative technologist for Moises Sanabria's **Archive Dreams in Public / The Futures We Inherited**, an independent artist-authored Wolfsonian research project. Work in the EXISTING repository `moisestech/wolfsonian-public-api-research`; do not create a parallel app or replace its existing persona family. You should execute permitted work and create a focused, reviewable implementation PR. Be scrupulous about what can actually be verified.

## Non-negotiable problem statement

**v1 already exists and works.** Cloudinary cloud `dck5rzi4h`, folder `archive-dreams/brand/personas`, contains **47 verified SVGs**: 11 personas × 2 colors × 2 sizes = 44 pictogram icons, plus three separate white Art Deco artwork studies. GitHub `docs/design/persona-cloudinary-manifest.json` and `src/persona-cloudinary-assets.mjs` resolve their version-pinned URLs. Family=house, Worker=tool, Archivist=record card, Futurist=arrow, Tourist=compass. Do NOT rename, overwrite, delete or visually approximate these existing files.

**v2 is a distinct illustrated character-portrait layer.** We are pursuing specific preexisting visual studies developed in the creative process: (1) Family, a nested/domestic architectural Deco mask with intergenerational profile language; (2) Worker, a human-industrial machinery profile preserving the worker's agency; (3) Archivist, a layered book, records, index-card/catalog-drawer face. These are **not** the v1 symbols, not archetype labels, and not the three white Deco studies (`deco-aperture-mask`, `deco-guardian-emblem`, `deco-mask-emblem`). No verified finished v2 character exports or Cloudinary uploads have yet been established. A partially generated Family concept and unrelated design sheets must not be mistaken for the approved trio.

**CRITICAL SOURCE GATE:** First locate and inspect the EXACT approved illustration bytes supplied by the artist (downloaded images from creative conversations, approved exported files, or confirmed asset links). Examine their actual visual contents, source/copyright ownership, cutouts, dimensions and alpha. Do not claim that an image is in Cloudinary merely because a chat once displayed it; do not invent URLs or silently regenerate approximations. If any approved source is unavailable, record `SOURCE_ART_MISSING` for that identity, implement only safe non-invasive scaffolding and documentation, keep v1 visible, and report the exact files required from the artist. Do not substitute a composite concept board or new AI-generated replacement.

## Inspect first (do not code blind)
1. `git status`, current HEAD and comparison to `origin/main`. Use a NEW branch from latest main; preserve unrelated uncommitted changes.
2. Read [Issue #79](https://github.com/moisestech/wolfsonian-public-api-research/issues/79), [Visual Production Bible](https://docs.google.com/document/d/1gdW4-1BEX12EJrwQyfFBOVm8DNKZ0S5hnOTKs7q_3g8/edit), current [asset manifest](https://github.com/moisestech/wolfsonian-public-api-research/blob/main/docs/design/persona-cloudinary-manifest.json), `src/persona-cloudinary-assets.mjs`, `src/persona-sigils.mjs`, `src/discovery-personas.mjs`, `demo/archive-society/society.mjs` plus styling and existing tests. Inspect Discovery Lab, Spatial Atlas and Object Lens only where they currently consume the identity system.
3. Inspect the existing 47 Cloudinary assets using the authenticated connector or exact version-pinned manifest, not search-engine images. Keep the 3 Deco studies non-speaking and the aperture logo under `archive-dreams/brand/`.
4. Read Airtable **Moises Art OS** → **Archive Dreams — Persona Asset Pipeline** (14 rows) and its linked parent work, **Archive Dreams in Public — The Futures We Inherited**. Treat uploaded state and approved state separately.

## P0 — Recover and export only approved character artwork
- Find the approved source illustrations for Family, Worker and Archivist. If a source is a composite sheet, isolate that SAME approved art without recoloring features, substituting a different portrait, or inventing missing areas; record the crop/derivative lineage.
- For each accepted identity, produce a transparent **full** artwork around 1024×1024 RGBA with equal optical scale, no opaque background/backplate, breathing room and clean contour; separately prepare a simplified **compact** artwork >=256×256, not just a tiny illegible downscale.
- For each full/compact create **white** artwork for charcoal/dark interface and **ink** artwork for archival-paper/light interface. Use color variants that genuinely preserve shape/alpha; do not threshold a photographic background into a false mask. If the approved artwork is multitone, seek artist approval for its two-tone treatment.
- Do visual sheet QA at 28, 42, 128 and 256px on real dark/light samples. **12 output targets total = 3 identities × 2 tones × 2 variants.** Do not count files merely planned as uploaded.
- Keep local original master artwork outside public bundles, with source attribution/approval status and derivative hash. Original works only; no Wolfsonian museum badge, undocumented historical portrait or collection imagery.

## P1 — Upload real files to Cloudinary, if and only if P0 passes
The folder `archive-dreams/brand/personas/portraits` already exists, initially empty. Upload verified transparent files with `overwrite:false`. Use these exact public-ID conventions and file extensions matching ACTUAL encoding:
```
archive-dreams/brand/personas/portraits/family-white-full-v2.png
archive-dreams/brand/personas/portraits/family-white-compact-v2.png
archive-dreams/brand/personas/portraits/family-ink-full-v2.png
archive-dreams/brand/personas/portraits/family-ink-compact-v2.png
# Repeat precisely for worker and archivist.
```
Use SVG only if a true vector source exists; don't relabel PNG as SVG. Record upload response `public_id`, `version`, `secure_url`, dimensions, format, alpha check, bytes/hash and approval note. Check each delivered image; a successful upload response alone is not sufficient. Do not push asset credentials or raw base64 to GitHub.

Store validated deliveries in a separate `docs/design/persona-character-portrait-manifest.v2.json`, with explicit missing/approved flags; never infer a version number from another persona or copy the v1 manifest URLs as purported portraits. Update the corresponding Airtable row's **Refined portrait URL** and status only after real asset verification.

## P2 — Minimal runtime integration, behind graceful fallback
Create or extend a central `personaCharacterUrl(persona, {tone,variant})` or equivalent. Exact v2 mapping must resolve from the validated manifest, not guessed string concatenations. Resolver order:
**approved uploaded v2 portrait → existing versioned v1 pictogram via `personaAssetUrl` → existing local SVG sigil fallback.**
A failed v2 image URL must not loop `onerror`; theme switching must reselect white for dark and ink for light without resetting active lens, room, playback or scroll.

Use v2 illustrated avatars preferentially at **expanded conversation speaker plates, portrait cards and larger speaking states**. Keep v1 compact sigils in 28–42px selectors if illustrated crops fail legibility tests. Update only actual UI consumers; do not duplicate the image implementation independently across views. Preserve current five Society selectable lenses: Family, Worker, Archivist, Futurist and Tourist. The six additional personas stay in the asset library; do not auto-activate them. `Museum` is a fictional interpretive role, never the museum's literal spokesperson. Perspective labels such as “At home” / “Provenance” are text descriptors, not different image IDs. Keep object photographs separate from persona portraits and source records.

Maintain the visual DNA of the original aperture logo and 1850s–1950s print/Art Deco design, but prioritize readability and genuinely distinct identities over decoration. No new 3D/AR feature, API integration, new dialogue generation or audio redesign is authorized by this ticket.

## P3 — QA, source ethics, release
- Unit/integration tests cover precise asset family IDs, missing v2, malformed URL, CDN rejection, v1/local fallback, dark/light switching, and the 3 non-speaking Deco studies.
- Browser test the actual UI at 320px / 390px phone, 768px tablet, and 1440px desktop, including perspective sheet, room, speaking state, object lens if affected. Verify 28/42/128px legibility, low bandwidth/no-image case, reduced-motion preferences, keyboard navigation, no unexpected horizontal scroll, image `alt`/adjacent readable label, and visually consistent masks.
- Run applicable `npm test`, `npm run build:public`, `npm run check:society:browser` or the existing project QA scripts. Inspect CI. Note unrelated preexisting failure separately rather than disabling tests. Public allowlist must still exclude staff matrix and captured Lakehouse files.
- Produce screenshots for v1/v2 comparison on dark and light, and a small audit of the 12 intended assets (file present, uploaded, verified, approved, integrated, QA).
- Documentation: update the Visual Production Bible, Airtable pipeline, issue #79, and a short in-repo design/usage note after each state change. Keep source-location status honest. No museum-media or historical image permissions are implied.
- Create a narrowly scoped PR with screenshots, hashes/version-pinned asset links, test log, and remaining blockers. **Do not merge or trigger a production release solely because the files compile.** Ask for artist visual signoff on actual portraits and ensure required review gates are met.

## Final response format
Report (A) latest inspected SHA and branch, (B) source illustration(s) actually found and provenance, (C) 12-row asset checklist with verified URLs or `SOURCE_ART_MISSING`, (D) code diff summary and exact UI placements, (E) preview screenshots and test results, (F) Airtable/Drive/GitHub record URLs, (G) PR URL and whether it is review-ready, and (H) the **smallest next artist action** if source images remain missing.

**Important:** An accurate “cannot finish without the original approved Worker/Archivist image files” is a successful safety boundary; a silently substituted icon is not.
