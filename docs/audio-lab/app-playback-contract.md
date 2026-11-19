# Archive Society — recorded listening integration contract

**Status:** designed, not live · 18 November 2026. No recorded files are approved or in this repository. This document is a handoff for the first five NotebookLM × ElevenLabs listening experiments, not permission to release them.

## Visitor experience

A single selected question/room has two clearly distinguished **optional** recorded experiences, shown only when the associated track has cleared independent artist/publication review:

1. **Hear the scene** — an exact *artist-authored fictional performance* from an approved multi-speaker ElevenLabs recording. Speaker identity follows the original scripted turns by stable turn IDs, not a reconstructed model output. The active collection object portrait and corresponding dialogue bubble receive subtle speaking emphasis; the fictional Archivist gets the **Archivist persona** symbol, not a museum-curator badge.
2. **Explore the sources** — an *AI-generated two-host research discussion* from NotebookLM. Hosts speak as hosts, not museum objects or institution employees. The player shows a neutral double-host / waveform identity, chapter markers where independently reviewed, the original source links and a reviewed transcript/accessible equivalent. **Never animate an object portrait as the NotebookLM speaker.**

**Where:** the existing Room/Conversation page, not a sixth bottom-navigation destination. On desktop, place an unobtrusive mode-switch above the existing `#voice-controls` rail player. On mobile, keep the existing **Listen** bottom action; when a cleared recording exists, open a thin bottom-sheet/mini-player with `Hear the scene` and `Explore the sources`, each clearly labeled and with a distinct source badge. If no recorded tracks are published, the existing local-device reading workflow stays intact; the user should not see a disabled or misleading "audio available" badge in the feed.

**Discovery:** only question cards with approved, playable audio get a small headphones glyph and an accessible label (e.g. `Audio available: performed scene`), never a blanket icon for all rooms. Nothing autoplays when opening a card, map node, source record, or changing persona.

## Listening states

- **Idle:** labels + user-initiated Play. Full conversation transcript remains visible.
- **Playing — performed scene:** use `HTMLAudioElement` events and a verified `timeupdate` → cue lookup; emphasize exactly one active `turnId` + its `objectA|objectB|archivist` role, color the existing `#voice-controls` bars, call the existing `stage.setSpeaking(accession)` only when the role's accession is correct, and use the existing bubble's `.speaking` state. The progress indicator represents actual media time, not model activity. Small node glow and character icon pulse are permitted but must stop on pause and respect reduced motion.
- **Playing — NotebookLM research:** do **not** call `stage.setSpeaking()` for any object, do not light the object's portrait or verbatim `.turn.speaking` bubbles. Show `Research discussion · two AI hosts`, elapsed/progress, pause/seek and manually reviewed chapter annotations. A generated overview does not share the authored scene transcript.
- **Paused:** preserve current audio position and current selected cue (without pulsing); inspecting Record/Evidence pauses, never discards listening position.
- **Seek:** recompute the active cue from timecode, do not guess. **Ended/Stop:** clear active roles and speaking classes, keep the current room and transcript open; replay starts on explicit tap. **Error/unavailable:** show a clear message and transcript, without automatically sending content to an external TTS provider.
- **Keyboard/screen reader:** native play/pause/seek/volume controls or equivalently accessible buttons and slider; label current mode; no playback on focus. Transcript navigation remains independent of playback.

## Manifest boundary

A reviewed, **publishable** record can be appended to a separate public manifest *only after* audio file, original script, voice use, source attribution, and publication rights are cleared. During the research sprint, keep recordings and timed transcripts local in `.local-research/audio-lab/`; use the local A/B listening room from PR #75.

Illustrative shape — **not an existing file**, not usable for public playback:

```json
{
  "sceneId": "01-household-audience",
  "mode": "scripted_performance",
  "audio": {"url": null, "mimeType": "audio/mpeg", "durationMs": null},
  "objectA": "2012.6.1",
  "objectB": "XX1990.1484",
  "scriptRevision": null,
  "sourceBriefUrl": "https://docs.google.com/document/d/1AqUXIPhYMXVI_V0AHpCENXc774--mOKPlHdV3Qn6PsQ/edit",
  "provider": "elevenlabs",
  "turnCues": [
    {"turnId": "01-household-audience:t1", "speaker": "objectA", "startMs": null, "endMs": null}
  ],
  "voiceRightsReviewed": false,
  "sourceReviewApproved": false,
  "publicPlaybackApproved": false
}
```

For NotebookLM replace `mode` with `research_discussion`, use `hostA|hostB` only for independently verified host/segment cues, and **do not** attach object-specific turn IDs. No synthetic transcript alignment or invented timecodes. If a track lacks reviewable transcript or accessible summary, it must not publish.

Store published approved audio through Cloudinary only after source/usage review; a possible dedicated **future** asset folder is `archive-dreams/audio/reviewed/` (avoid storing research-only previews in a public CDN). The serving manifest pins exact immutable URLs, export format, provider, license status, and approved revision. Never dynamically publish everything found in a folder.

## Build sequence / no-release gates

1. User creates five private NotebookLM short Audio Overviews using their individual Google Drive public-source briefs, then exports audio. Do not upload private Lakehouse extracts, staff object matrix, restricted images, or undocumented source material.
2. Generate five original ElevenLabs Text-to-Dialogue takes from the exact per-scene scripts (separate pipeline). Each identity uses a distinct permitted fictional voice and retains accession attribution.
3. Locally review A/B pairs and document source errors, naturalness, pronunciation, rights, accessibility, exact text and timestamps. If one take invents a source fact or impersonates historical testimony, reject it.
4. Only after approval, add a public audio manifest, browser tests, and the actual mode selector in the Society app. The first launch may use a single reviewed scene; other cards must not advertise audio.
5. QA 320px/390px and desktop, light/dark, autoplay, pause-on-record, seeking, media/network error, reduced motion, transcript, `Content-Security-Policy` and Cloudinary budget. Verify the public build does not package any research recordings or staff data.

The present `#space-play` / `#voice-controls` local voice is an existing on-device / single-turn speech preview. It must not be mislabeled as a NotebookLM research discussion or a context-aware ElevenLabs *performed scene*.
