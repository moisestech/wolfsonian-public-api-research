# Cursor master prompt — Implement verified Archive Society persona v2 portraits
**Updated:** November 19, 2026 · **State:** Cloudinary assets uploaded and inventoried; runtime integration not yet implemented · **Tracker:** [Issue #79](https://github.com/moisestech/wolfsonian-public-api-research/issues/79)

You are working on Moises Sanabria's independent artist-authored `Archive Dreams in Public / The Futures We Inherited` in the EXISTING repository `moisestech/wolfsonian-public-api-research`. Act as the senior design engineer, accessibility reviewer, and careful maintainer of source/fiction distinctions. **Execute the implementation, not another generic proposal.** Do not fork a parallel app.

## Source of truth: v2 images ALREADY uploaded

**VERIFIED cloud name:** `dck5rzi4h`.
**VERIFIED v2 folder:** `archive-dreams/brand/personas/portraits`.
**VERIFIED, complete manifest with actual public IDs, versioned HTTPS delivery URLs and dimensions:** `docs/design/persona-character-portrait-manifest.v2.json` on branch `docs/persona-v2-cursor-handoff-20261119`. This has **22 verified Cloudinary PNGs**:
- Family, Worker, Archivist each have sepia, white and ink images, with full 1024×1024 and compact 256×256 variants (**18 primary files**).
- Family has a second, distinct geometric Deco-mask interpretation, in white/ink full+compact (**4 optional alternate files**).
- The artist has approved the illustrated designs. DO NOT regenerate or substitute new portraits, and DO NOT claim image uploads are missing.
- The three sepia masters were extracted from an approved composite image board with a character region approximately 165–170px square, then transparency processed and placed in a 1024px export canvas. **This is NOT equivalent to 1024px-native original artwork.** It is suitable to test visually in UI but may not suit large-scale exhibition output. Retain provenance, actual quality limitations, and a future high-res replacement path.
- Full artist artwork staging contact sheet/source: https://docs.google.com/document/d/1lITPU4nNOflw3waFogyUIGE8psLh_kvo9obTgrKzy0Q/edit

**EXISTING v1 icons MUST REMAIN:** 47 verified SVG assets in `archive-dreams/brand/personas`: 11 identities × 2 tones × 2 sizes = 44 functional sigils, plus 3 non-speaking Deco studies. See `docs/design/persona-cloudinary-manifest.json` and `src/persona-cloudinary-assets.mjs`. The parent aperture logo under `archive-dreams/brand/` remains brand-identifying and separate. NEVER overwrite these v1 files.

**Existing visitor perspectives:** 5 selectable lenses ONLY: Family / Worker / Archivist / Futurist / Tourist. Six other identities remain in library; no automatic lens expansion. Label vocabulary such as “At home”, “Provenance” are text descriptors of existing identities, not new image IDs. `Museum` is a fictional interpretive identity, never an official museum voice. The three white Deco studies do not speak.

## P0 — Verify current repo and actual files before editing

1. Inspect `git status`, latest `origin/main`, PR #80, merged icon PRs #77/#78, and current runtime/test pipeline. Do not overwrite work in progress. Start a focused feature branch `feat/archive-persona-v2-runtime-20261119` from a current main or from the documentation PR branch, then reconcile any divergence.
2. Read manifest `docs/design/persona-character-portrait-manifest.v2.json`, and compare all 22 actual Cloudinary `publicId`/`version`/`url` entries against their current public delivery and its thumbnail appearance; record any unreachable asset as an explicit fallback, do not fake success.
3. Inspect actual persona consumers in `src/persona-cloudinary-assets.mjs`, `src/persona-sigils.mjs`, `src/discovery-personas.mjs`, `demo/archive-society/society.mjs` and CSS, plus Discovery Lab / Spatial Atlas / Object Lens only where persona identity is already used. Identify where current full and compact v1 is bound. Preserve all important UI semantics, current scene playback, and privacy controls.
4. Cross-check Creative Production Bible and Airtable; do not assume “Cloudinary uploaded” means “production integrated” or visual QA passed.

## P1 — Integrate a clean and reviewable v2 resolver

Implement a minimal, central `personaCharacterUrl(persona, {palette, tone, variant})` (or equivalent) using **exact manifest URLs**. `palette` may be `sepia` / `white` / `ink`; `variant` may be `full` / `compact`. Do NOT build URLs using guessed version numbers. Choose sensible defaults based on actual scene presentation, with sepia for large portrait emphasis and theme-appropriate monochrome artwork where stronger integration works.

Keep `personaAssetUrl` and all v1 CDN mappings backwards compatible. Fallback chain when v2 missing or broken:
1. valid uploaded v2 URL for the selected identity/palette/variant;
2. existing version-pinned v1 sigil for same identity with white on dark, ink on light;
3. existing local `src/persona-sigils.mjs` SVG.

Avoid infinite `onerror` retries, semantic mismatch, hydration flicker and broken URLs. Main feature must still work if every v2 image fails. Resolve `family-deco-mask` as an explicit optional Family alternative, NOT a separate twelfth identity, and do not silently switch the approved Family sepia portrait.

Use fully transparent PNGs as delivered; do not introduce opaque square backgrounds. Avoid stretching and ensure correct object-fit and safe margins. Do not take downloaded remote image asset metadata as proof that pixels are optically crisp at small sizes.

## P2 — Targeted interface behavior

Prioritize persona portraits where character identity helps the user understand who is speaking:
- Conversation full-size speaker/portrait stage, expanded cards, scene introduction and contextual persona detail.
- Active speaker indicators, *only when an actual fixed transcript turn is known*; do not imply an unverified AI is speaking or align to audio without real timecodes.
- Mobile perspective sheet at 42–72px only where legible; keep 28px compact v1 sigils in dense lists, footer, small navigation or the 320px picker if clearer.
- Light/dark theme switching must preserve active persona, scene, scroll and play/stop status. White vector for charcoal backgrounds, ink for light paper; sepia character plate can work on both if contrast verified.
- Maintain labels and accessible naming. Decorative portraits should have empty alt with adjacent visible text; a sole image carrying identity requires meaningful alt or aria-label. Preserve reduced-motion and no-autoplay.
- Do not alter source-backed collection evidence, accession identities, private matrix boundaries, or launch AR/another new feature.

Do not replace the existing five perspectives with eleven. Do not use historical person portraits or actual Wolfsonian insignia.

## P3 — Tests and evidence

- Update/add automated coverage: manifest completeness = 22 IDs; three persona sources; 18 primary and 4 Family alt; fallback for inactive identities; error handling; theme variant mapping; no speaking Deco studies; no unintended v1 URL change.
- Run `npm test` and the applicable public build/browsers. One previous main Actions run had a stale conversation-orientation regex expectation; fix the test to reflect observed source/UI semantics rather than disabling it. Document any unrelated failures.
- Capture actual 320px, 390px, 768px, desktop screenshots for perspective picker, conversation header, speaker stage; compare v1-only and v2 paths, light and dark. Check alpha, image fetches, legibility at 28/42/128px, reduced motion, keyboard accessibility, no horizontal scroll.
- Public-site allowlist must remain safe: NO staff matrix, nonpublic Lakehouse extracts, restricted photographs or unrelated data in public bundles.
- Preserve good browser performance; avoid loading 1024px portrait where 256px compact suffices.

## P4 — Track & deliver

- Update Airtable **Moises Art OS → Archive Dreams — Persona Asset Pipeline** (14 tracked entries) for Family, Worker and Archivist. Their source visual approval is established, v2 uploaded, but **runtime QA remains pending**. Link actual Cloudinary source URLs and GitHub PR.
- Reference working Google Doc: https://docs.google.com/document/d/1lITPU4nNOflw3waFogyUIGE8psLh_kvo9obTgrKzy0Q/edit
- Update Visual Production Bible: https://docs.google.com/document/d/1gdW4-1BEX12EJrwQyfFBOVm8DNKZ0S5hnOTKs7q_3g8/edit
- Source GitHub issue: https://github.com/moisestech/wolfsonian-public-api-research/issues/79
- Draft documentation PR containing this prompt and verified asset manifest: https://github.com/moisestech/wolfsonian-public-api-research/pull/80
- Deliver a **new focused runtime implementation PR** (not a production deployment), with screenshots, test log, manifest-to-view mapping and clear remaining approval/visual issues. Do not auto-merge until reviewed.
- Report exactly (A) repo SHA/branch, (B) portrait map and screens changed, (C) URL/404 checks, (D) 320/390/tablet/desktop screenshot review, (E) test/build status, (F) PR link and (G) explicit blockers. Do not invent delivered behavior.

### Done means
The existing five-lens visitor app continues to work; Family, Worker and Archivist show the approved v2 artworks at useful portrait scale; small UI remains clear; all v1 icons and Deco studies still exist; dark/light, audio states and source evidence behave as before; Cloudinary assets resolve; automated tests and browser QA are reproducibly green; public/private boundaries remain intact.

**Execute now using the real uploaded assets rather than generating new characters or searching for nonexistent source URLs.**
