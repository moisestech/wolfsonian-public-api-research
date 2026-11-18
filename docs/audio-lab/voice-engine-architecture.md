# Archive Society — layered voice architecture

**Status:** Audio laboratory, not a deployed feature · November 18, 2026

## Problem
A silent text conversation becoming generic speech-to-text playback does not feel like a society. The next layer is an *encounter with listening, disagreement, improvisation, rhythm, and sustained character identity*. The experiment must avoid presenting fictional object voices as real museum testimony.

## Three distinct narrative channels

**1. The scripted object scene** (current app / future ElevenLabs Dialogue)
- Public research packet + reviewed editorial script → assigned voice per object → complete scripted multi-speaker performance → consent-gated audio asset and manifest.
- Stable accession identity and `turnId`; every line is `ARTIST_AUTHORED_FICTION`; exact text can be verified and synchronized to an object portrait.
- For third-person scene interrupts use `fictional_archivist`, conspicuously NOT a real curator or museum representative.
- Use a dialogue-capable model for **one context-aware clip** rather than independent single-speaker TTS responses pasted end-to-end. ElevenLabs Text to Dialogue currently supports v3/v4 and per-turn speakers. Test audio tags on a separate render and confirm they do not alter factual text or speak metadata aloud.

**2. The research discussion** (NotebookLM / Gemini Notebook Audio Overviews)
- Only permitted public source briefs + a curatorial discussion instruction → two AI hosts discussing the question.
- The hosts are **not** the collection objects, their fictional voices, or actual museum employees. Output is a generated source overview that can vary across takes. It may expand or paraphrase: review against the sources.
- The source briefs in Drive intentionally **exclude fixed dialogue**. This makes it possible to compare spontaneous structure, pauses, mutual correction and backchannels with our authored scripts. Do not synchronize host turns with object portraits as if the objects spoke.
- Preserve the distinction in the app: “Research discussion” vs “Performed scene,” never an unlabeled generic Play button for both.

**3. The live evidence explorer** (later, not in this experiment)
- A real approved search/retrieval operation can expose genuine `retrieving → comparing → source ready → question proposed` states, but must separately cite source fields. A pre-recorded clip cannot show “model thinking.”
- No live model, external embedding provider or visitor voice recording is required for this first A/B laboratory.

## A three-layer audio UI without visual clutter

1. **Object portraits:** retain existing accession labels and record-inspection arrow.
2. **Conversation timeline:** highlight the active authored turn and active speaker in the existing Three.js atlas; for NotebookLM host research discussion, use a neutral paired-host indicator instead of pretending either museum object speaks.
3. **Quiet bottom transport:** Play / Pause / Replay, a small volume/waveform bar driven by audio amplitude if available, elapsed time, clearly labeled source/performance type and “Why these two?”. No autoplay. A reduced-motion version keeps the bar static.

The platform's recorded dialogue is a **performance artifact**; the authored script is the source of truth for exact character speech. Audio and text should share a stable `turnId` only when aligned. A NotebookLM improvisation can instead carry a curated chapter-level annotation with non-verbatim paraphrase; do not substitute its transcript for the historic object record.

## Proposed audio manifest (future, not generated yet)

```json
{
  "experimentId": "01-household-audience",
  "mode": "scripted_performance",
  "voiceProvider": "elevenlabs",
  "voiceModel": "verify_at_render_time",
  "audioAsset": null,
  "audioRightsApproved": false,
  "publicPlaybackApproved": false,
  "reviewStatus": "unreviewed",
  "scriptRevision": "tracked_git_commit",
  "objectA": "2012.6.1",
  "objectB": "XX1990.1484",
  "timing": [
    {"turnId":"01-household-audience:t1","startMs":null,"endMs":null,"speaker":"objectA"}
  ]
}
```

No guessed timecodes. Determine timing with provider metadata when it actually exists, or align verified output locally with explicit permission. Review manually before syncing visuals.

## Experimental operating procedure

- First produce NotebookLM short Audio Overviews from **source briefs 01–05**; do not send staff-matrix data, private Lakehouse outputs, unpublished curator notes, or restricted photographs to external services.
- Produce the **same five edited scripts** in ElevenLabs Dialogue. Compare 20–40s samples from matched moments, and retain the exact provider/model/voice settings locally.
- Score naturalness, speaker distinctiveness, respectful handling of sources, pacing, interruptions, repeat listening value and object/voice alignment (1–5). This is **an artistic A/B test**, not a proof that audio is historical.
- Review generated statements against the named museum-published pages. If a model introduces an unsupported fact, correct or reject the take; do not quietly rewrite catalog evidence.
- Expand to experiments 06–10 only when their source briefs and external processing permissions are confirmed; keep all drafts outside the public deployment until reviewed.

## Audio rights / museum ethics
- Collection images are not licensed by the existence of a public checklist.
- Never clone an artist, staff member, or historic person's voice without documented permission. Use original fictional voices.
- Prefer high-quality authored material and identifiable personification over invented claims.
- Mark theatrical “convening” animations as performance, never actual AI computation.
- Preserve full textual alternative, keyboard support, reduced motion, and a no-audio experience.

## Current code integration
- `src/scene-performance.mjs`: authored scene performance cues and turn roles.
- `demo/archive-society/society.mjs`: scripted conversation UI and explicit listening/cancellation.
- `server/archive-services.mjs`: existing **single-turn** consent-gated voice service; don't misrepresent it as contextual dialogue.
- `src/curatorial-relationships.mjs` and `src/curated-edge-scenes.mjs`: public-packet and staff-tag distinction.
- `data/research/audio-lab/experiments.json`: proposed *research-only* dialogue and role metadata.

Official platform references:
- https://support.google.com/gemininotebook/answer/16212820
- https://elevenlabs.io/docs/overview/capabilities/text-to-dialogue
- https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/how-do-audio-tags-work-with-eleven-v3-and-v4
