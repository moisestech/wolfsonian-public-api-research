# Conversation Performance Director — artist's editing and sound guide

**Operating target:** November 19, 2026, internal demonstration.  
**Status:** Original artist-authored editorial revisions and local-voice direction awaiting artist/curatorial sign-off; **not an institutional script** or proof of historical testimony.

## 1. Why this matters

A society is not three generic text-to-speech characters. Every edge should expose an argument between two *objects*, then allow the fictional Archivist to challenge the connection's evidentiary basis. The voices need to carry *positions*, not simulate the historical authors or the cultures represented in the collection.

**Key distinction:** the object's *identity* is its accession, title and source; its *performance* is an artist-authored interpretation tied to this specific exchange. The same object can sound skeptical here and visionary in another encounter. Source credibility does not change when its sound changes.

## 2. Three-beat writing score

All 16 curated scenes retain three authored turns and an external visitor continuation question:
- **Object 1, proposition:** make a specific claim, need or doubt rooted in the existing object's title and metadata, without impersonating the real maker.
- **Object 2, contradiction:** respond to the *idea just proposed*, not simply introduce another metadata fact. Distinguish its stakes: agency vs recognition, risk vs achievement, exhibition vs commerce, promise vs threat.
- **Archivist, evidence boundary:** describe the precise source category that produced the link and *what it cannot prove* (shared maker, audience, ideological alignment, workplace, influence or event). The Archivist may expose that an algorithmic edge is a poor hypothesis rather than defending it.
- **Visitor continuation:** ask what *new evidence* would improve the comparison; support following the record or rejecting the edge.

**The opening is not six interchangeable scenes:** Women/Labor lottery asks whether attention equals recognition; women's exhibition asks who shapes public memory; engine-making asks how the product eclipses the producer; political poster asks who speaks for labor; 1917/1939 asks what a date does to expectations; aerial-view aircraft asks what technological spectacle conceals.

**Two self-critical scenes** (Trees / Water) are explicit model failure cases. They should feel *awkward on purpose* so the viewer notices an algorithm searching for relevance where little is supported. Their ending does not need a satisfying connection.

**Editorial safeguards:** no unverified facial/visual details, no invented object-to-object historical contact, no extrapolated provenance, no official museum or historical-person voice claims, no political endorsement. Actual image inspection and publication permission remain separate gates.

## 3. Voice performance architecture

Implemented in `src/conversation-performance.mjs`:

```text
Source-backed selected edge (actual metadata reasons)
  → sceneId + ordered 3-turn authored script
  → hand-authored PERFORMANCE_SCORE (objective, tension, 3 deliveries)
  → directConversation(script, installedVoices, manualOverrides, mode)
  → immutable voice plan for this playback
  → browser SpeechSynthesis (localService===true)
  → current turn and real node/edge highlight
  → text remains available even without audio
```

**Scene variety, default:** FNV-1a-like deterministic selection from the device's *installed local voices* based on `sceneId | accession | delivery`. Voice allocation favors different voices inside the scene whenever possible, avoiding robotic A/B/A/B repetition. Replaying the same encounter on the same device chooses the same voice. Voice range and tempo change modestly with dramaturgical labels (observe, provoke, question, insist, speculate, reflect, caution, doubt, document). No random runtime fluctuation.

**Object continuity, optional:** select a fixed installed voice from accession alone. This sacrifices maximum within-scene contrast if voices collide, but retains voice identity across encounters. Explicit manual role overrides also remain possible.

**Archivist:** always has a restrained performance direction (`document`), but can vary its installed timbre across scenes under Scene variety. This is an intentional curatorial question: should it become one disembodied institutional consciousness or multiple conflicting readings? Do not hardcode before reviewing on devices.

**Important limitations:** no voice inventory can be promised on an iPhone/browser; some devices expose only one local voice. Explicitly remote `SpeechSynthesisVoice` entries are rejected. The system falls back to readable text and does *not* silently send speech to an API. Casting never guesses or assigns voice by race, national origin, gender, a named person, portrait, or political content. For historical accuracy, voice color is a theatrical design choice, not evidence.

## 4. Production path and total cost

The scripts and their performance scores now export to `node scripts/export-curated-audio-cues.mjs`. Each turn receives:
- Scene ID, accession/role, original authored text
- Direction and suggested pacing/pitch
- Content hash and proposed audio filename
- `NOT_RENDERED` state (until production actually happens)

After line-by-line sign-off, the exact same cue sheet can drive *offline Kokoro synthesis*, or one-time production using a cloud provider; no visitor incurs a speech-generation call by replaying a static scene. A text edit changes the hash and invalidates any obsolete audio file.

**For Thursday:** use browser-local casting as optional enhancement and keep the transcript fully functional; do not make unproduced paid clips, authorization of historical voices or cloud network access a release dependency.

## 5. Human writing and voice review

Review each scene in the five-chapter guide, using its shared tag and source inspector:

| Criterion | Ask during review |
|---|---|
| Specificity | Could this line be said by *any* other object? If yes, rewrite it |
| Conflict | Does the second object actually respond to the first? |
| Source fidelity | Does a sentence claim a fact that the reviewed titles/tags do not establish? |
| Institutional critique | Can a weak metadata edge be challenged or withdrawn? |
| Variation | Does the selected local cast make this scene sound unlike the prior one? |
| Legibility | Is the line still understandable when the visitor mutes audio? |
| Respect | Would this performance misrepresent a historical person or imitate a culture? |

A practical rehearsal pair is **Making the Engine → Grind Safely** because the disagreement is audible without requiring an invented historical link. Then test **Paul Robeson → Architectural Fantasies** to see whether the dubious Trees motif is appropriately *refused*, not dramatized into false history.

**Do not auto-approve after a successful browser test.** Treat the 16 scenes as editor-reviewed drafts until the artist and relevant curatorial reviewer accept the wording, tones and intended internal use. Actual iPhone/projection playback and the collection-record/asset permissions (#25/#27) remain separate release decisions.

## 6. Artistic decisions agreed on November 17

The artist selected two definitive defaults:

1. **One Archivist:** A single recognizable, installed local Archivist voice across every scene and both tones by default. This remains fixed even when other objects vary per scene. In Admin, an opt-in **Multiple Archivists (experimental)** setting allows scene-varying institutional voices. It does not change the Archivist's source evidence.
2. **Two switchable conversation registers:** A visitor-facing **Argumentative / Critical** and **Poetic / Uncanny** selector. The first is the full revised 16-scene script; the second is a separately authored set of 32 object readings, two for each scene. The same 16 Archivist evidence statements remain *verbatim* across both registers. The selected register is shareable via `?tone=poetic`, and changing it preserves the graph edge, object IDs and source evidence.

Both registers are artist-authored fictional speeches, not generated live. Poetic text is read slightly slower; the Archivist's pace, identity and evidence remain fixed. Unscripted metadata-only scenes intentionally do **not** invent poetic variants.

**Editorial practice:** Review each scene in both registers. The mode should change *what is being experienced*, not make unsupported history seem more certain. For politically sensitive objects, review the poetic metaphors for unintended glamorization or misrepresentation.

### Optional casting controls

- **Archivist:** Single consistent voice by default; **Multiple Archivists (experimental)** is an explicit opt-in in Admin.
- **Objects:** Scene variety by default; **Keep voice per object** is an opt-in in Admin. These are independent from the Archivist choice.
- **Tone:** Every visitor can change the two authored texts while keeping the current edge and evidence; cast direction follows the selected writing style.

## Links

- Source registry: `src/curated-edge-scenes.mjs`
- Poetic variants and invariant evidence: `src/conversation-tones.mjs`
- Director and score: `src/conversation-performance.mjs`
- Playback/admin casting preview: `demo/archive-society/society.mjs`
- Audio cue export: `scripts/export-curated-audio-cues.mjs`
- Curated guide: `src/conversation-guide.mjs`
- Tracking: [Internal experience](https://github.com/moisestech/wolfsonian-public-api-research/issues/31) · [Source rights](https://github.com/moisestech/wolfsonian-public-api-research/issues/25) · [Restricted preview](https://github.com/moisestech/wolfsonian-public-api-research/issues/27)

**Repository flow:** this is a stacked feature based on PR #35, which itself incorporates PR #33. Review/merge in order after checking newest user pushes to upstream branches. Never overwrite the user branch or assume Vercel success means it was promoted to a rights-cleared internal release.
