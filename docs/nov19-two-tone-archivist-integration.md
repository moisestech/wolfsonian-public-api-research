# November 19 — two-tone dialogue and Archivist voice, integrated with the latest Spatial Atlas

**Project:** Archive Dreams in Public · Wolfsonian artist research  
**Date:** November 17, 2026  
**Branch base:** `4f5898f1f55f2dbee9528d299e3d0666a8c021b6` (latest merged spatial-atlas PR #20)  
**Status:** artist direction accepted; editorial verification and real-device audition pending.

## Artistic choices

The visitor can change a visible **Conversation tone** selector between:
- **Argumentative / Critical** (default): object A proposes a position; object B challenges the premise; the Archivist names the evidence boundary.
- **Poetic / Uncanny:** 32 separately authored object lines across the same 16 scenes; language is more suggestive and speculative, but makes no additional historical claim. The 16 Archivist lines stay **identical** in both modes.

The selected tone does **not** alter the underlying edge, recorded tag, accession pair, interpretation status, links, source inspector, or institutional metadata. Unscripted metadata-only conversations retain their original safe copy in either mode. A `?tone=poetic` URL parameter allows reviewers to open the poetic version of a scene; the page does not track visitor profiles.

### Archivist's voice and object identity

- **Default:** One recognizable local Archivist voice across all scenes and both tones, with fixed evidence-bound delivery.
- **Optional in Settings:** Multiple Archivists (experimental), with scene-varying local voices. This option is off by default.
- **Objects:** Vary local voice per scene/argument by default; optional *Keep voice per object*.
- All selected speech voices must be installed on the device (`localService === true`). If no local voice is available, the full written scene remains visible; the app does not automatically send text to an external speech provider.
- Voice casting uses no demographic, nationality, ethnicity, named-person or political assumptions. Fictional first-person object speech must not be mistaken for historical testimony.

## Code architecture (main compatible)

```
Latest main: source-backed graph + current zoom / visitor layout
  ↓ conversationFor(source,target,realEdge)  [unchanged selection rules]
  ↓ withConversationTone(conversation,'critical'|'poetic')
      changes original A/B dialogue only, not canonical Archivist or evidence
  ↓ renderConversation + paintScene in latest spatial Atlas layout
  ↓ directConversation(..., {tone, archivistMode, style})
      stable Archivist voice / optional plural institution
  ↓ local device SpeechSynthesis; source remains the caption
```

### Files

- `src/conversation-tones.mjs` — full 16-scene paired register, pure immutable transform
- `src/conversation-performance.mjs` — deterministic locally cast three-beat score, default fixed Archivist
- `src/local-voice-cast.mjs` — filter remote browser voices
- `src/curated-edge-scenes.mjs` — revised 48-line critical scene scripts
- `demo/archive-society/index.html` — visible tone selector and optional settings
- `demo/archive-society/society.mjs` — live tone switch, shareable URL, local voice director; retains new spatial-atlas UX
- `scripts/export-curated-audio-cues.mjs` — separate 48-cue exports for each tone, with content hashes, `NOT_RENDERED` status
- `test/conversation-tones.test.mjs` / `test/conversation-performance.test.mjs` — all-scene invariance, voice variety, no remote TTS, plural option, canonical sources

## Acceptance gates

- [ ] Exact PR head: Node, source registry, Chromium 390px, Object Lens checks pass
- [ ] Both tones preserve the **same** Archivist line and shared metadata evidence for each of the 16 scenes
- [ ] Archivist voice has **one** device-local identity across all scenes and tones by default
- [ ] Plural opt-in varies voices only if the device has multiple local voices
- [ ] Source-backed graph and the user's new spatial-atlas navigation are unchanged
- [ ] Review politically charged scripts and poetic metaphors with artist/curatorial team
- [ ] Actual internal browser, presentation laptop and phone audio test
- [ ] Confirm access protection and metadata/photo rights in existing issues #25 and #27 before public exposure

## Audio production

After editorial signoff, pre-recording remains the economical path. Both tonal scripts are ready for *export*, not audio playback:

```bash
node scripts/export-curated-audio-cues.mjs --tone=critical > cues-critical.json
node scripts/export-curated-audio-cues.mjs --tone=poetic > cues-poetic.json
```

Each tone has 48 cue lines; Archivist lines are unchanged and can be de-duplicated during production, giving **80 unique texts** across the two modes (32+32+16) rather than 96 unique reads. No provider has been contacted, recordings generated or assets redistributed.

**Release note:** This main-based branch was made because PRs #33, #35 and #36 conflict after the November 17 spatial-atlas update. It integrates the two artistic decisions **without reverting** the user's new graph/layout code. Review the older PRs separately before any merge; do not merge them blindly or auto-promote public deployment.
