# Archive Society — Ten Voice Experiments (18 Nov 2026)

The object society should **sound like an encounter, not an audiobook or raw TTS**.
These ten short original scripts test micro-interruption, associative thought, self-correction, distance, counterargument and source humility. They are *research samples*, not additions to the existing 36 public-preview rooms.

## Priority 0 — generate five safe-source experiments first
- [01-household-audience](01-household-audience.md) — When does a household become an audience? — **quick_banter**, Deep Dive
- [02-promise-souvenir](02-promise-souvenir.md) — When does a promise become a souvenir? — **duel**, Debate
- [03-globe-theme-center](03-globe-theme-center.md) — How much of a world can an object hold? — **slow_contemplative**, Deep Dive
- [04-poster-program](04-poster-program.md) — Who gets to say tomorrow is open? — **documentary_counterpoint**, Critique
- [05-who-is-modern](05-who-is-modern.md) — Who gets named when we call a design modern? — **light_irony**, Debate

## Priority 1 — five further experiments, check external source permissions first
- [06-machine-and-body](06-machine-and-body.md) — Can a machine speak about the body it depends on? — **interruptive_trio**, Debate (HOLD_EXTERNAL_UNTIL_TITLE_SOURCE_APPROVED)
- [07-trees-not-proof](07-trees-not-proof.md) — Can a tree prove that two objects belong together? — **epistemic_refusal**, Critique (HOLD_EXTERNAL_UNTIL_TITLE_SOURCE_APPROVED)
- [08-naming-an-era](08-naming-an-era.md) — Who has the authority to name an age? — **adversarial_comedy**, Debate (HOLD_EXTERNAL_UNTIL_TITLE_SOURCE_APPROVED)
- [09-invited-future](09-invited-future.md) — Who is invited into the future? — **critical_dialogue**, Debate (PUBLIC_CHECKLIST_ONLY_EDITORIAL_REVIEW_REQUIRED)
- [10-invisible-work](10-invisible-work.md) — Can an exhibition represent the people who made it possible? — **intimate_reframing**, Critique (HOLD_EXTERNAL_UNTIL_TITLE_SOURCE_APPROVED)

## Two pipelines, not one
**NotebookLM/Gemini Notebook:** Create a notebook per experiment, add *only permitted public sources and our original brief*, choose Deep Dive, Debate or Critique, and paste the scene's customization prompt. It will generate a fresh two-host audio discussion; it **will not guarantee verbatim lines, object-character identities or a third fictional Archivist**. Review accuracy before any publication.

**ElevenLabs:** Use Text-to-Dialogue with `eleven_v3` or an available dialogue-capable model and assign an explicit approved voice to each turn in `data/research/audio-lab/experiments.json`; optionally map supported audio delivery tags (e.g., [interrupting], [hesitates]) from the cue metadata. Only upload original approved text, never source-restricted records. Audio rights/voice permission must be evaluated before release. Do not treat this as the existing single-turn speech service.

## A/B rubric (1–5 each)
1. Does each object feel like a *distinct* voice rather than a generic host?
2. Are interruptions or silences motivated rather than gimmicky?
3. Can a first-time visitor tell what's documented, inferred and fictional?
4. Can the audio sequence map to object portrait and transcript events?
5. Would replay be worth listening to for a second time?

## App integration sketch
A separate optional `sceneAudio` manifest should map `sceneId → asset URL (only after cleared) → ordered timestamps/turnIds → roles → evidence manifest revision → permission state`. When the current turn begins, mark the corresponding message bubble and object node active. Transcript stays accessible and scannable. Do not fabricate word-level timings from a generative NotebookLM audio file: mark approximate chapters or use **local, permission-approved transcription/alignment** once exported, verify manually. Playback never changes the underlying source record.

**UI progression:** chosen question → object convening animation → active audio turn → small conversational pulse / subtle node crossfade → record inspection → resume or next room. Respect reduced motion, consent, device constraints and no autoplay.

**Source boundary:** The public packets from `src/curatorial-relationships.mjs` use museum-published research links, but are still artist prepared, not staff approved. The staff-metadata-based scenes 06–08 and 10 must **not be uploaded externally with private matrix data**. The research-only checklist scene 09 needs editorial review before public release. No record packet grants collection image rights.

**Separate goal:** a temporary audio laboratory ≠ a live agent that invents historical characters or new archive claims. Never simulate the model “thinking” when simply playing a recorded piece.

Official references:
- NotebookLM / Gemini Notebook Audio Overviews: https://support.google.com/gemininotebook/answer/16212820
- ElevenLabs Text to Dialogue: https://elevenlabs.io/docs/overview/capabilities/text-to-dialogue
- ElevenLabs delivery tags: https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/how-do-audio-tags-work-with-eleven-v3-and-v4

## NotebookLM-ready Google Docs — first five
These clean briefs contain permitted source locators and interpretive prompts, **not** the fixed fictional dialogue. Import one brief per notebook and add the relevant museum public pages if source permissions allow.

- [01 — Household / audience](https://docs.google.com/document/d/1AqUXIPhYMXVI_V0AHpCENXc774--mOKPlHdV3Qn6PsQ/edit)
- [02 — Promise / souvenir](https://docs.google.com/document/d/1eMPfb6saxfZyDLkfiDWtNMZWPozzhbiKoD3dQ-HeQeE/edit)
- [03 — Globe / Theme Center](https://docs.google.com/document/d/1LOp4YspxZp550EjPcSCmyKx2JONPog0BglyRpw2g9ik/edit)
- [04 — Poster / program](https://docs.google.com/document/d/1z1MtpXdZtcTYIlSfxEkIGanBqiOH-XXVCPF3vxQcGl8/edit)
- [05 — Naming the modern](https://docs.google.com/document/d/1riFWezFUpMUJiJXK6hNIVeVhYbCAaXlN-d4eFvd7JB4/edit)

[Implementation and audio/speaker/event architecture](voice-engine-architecture.md)

## Local A/B audition room

Run from a checked-out audio-lab feature branch (with Node 24 installed):

```bash
npm run audio:lab:review
```

Open the generated **`.local-research/audio-lab/review.html`** in your browser. The file is entirely self-contained and stays inside the ignored local research directory. It includes all ten original scripted scenes but **no audio**. Pick one local NotebookLM download under panel A and its corresponding ElevenLabs Dialogue render under panel B. Listening to one pauses the other. Score five dimensions (distinctiveness, rhythm, integrity, vitality, and visual synchronization) and export review notes as a local JSON file.

**Privacy:** The file picker creates session-only browser blob URLs. There are no outgoing requests, analytics, media uploads or stored provider secrets. A review export contains only numbers, selected next-step decisions and written notes—not the audio tracks. The complete text remains visible for inspection. Nothing is wired into the museum-facing site.

**Important differences:** NotebookLM's two-host overview is spontaneous source discussion and may differ from the fixed script. The ElevenLabs render should follow the exact original object/Archivist turns. The app must never automatically label a NotebookLM host as the museum object or present it as a historical recording. Neither is public release-ready without source and licensing review.
