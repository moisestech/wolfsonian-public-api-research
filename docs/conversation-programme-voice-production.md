# Conversational programme and affordable voices — November 17, 2026

## Decision

For the **November 19 internal Wolfsonian experience**, a small, authored repertory is more artistically reliable and cheaper than continuous cloud speech generation. There are **16 scripted edges × 3 turns = 48 lines**, totaling approximately **5,120 text characters** in the source registry. No live model is required to make these objects appear to converse. A live model cannot substitute for intentional interpretation and verification.

**Keep three progressively enhanced modes:**
1. **Silent reading always works in two tones.** The new Conversation Stage displays all three turns immediately, with a large active line, visible speakers, Next/Previous, graph synchronization and an evidence inspector. This is the canonical experience and must work offline.
2. **Device-local voice cast (implemented in this branch).** Offer three device-local installed voices for Object A, Object B and the fictional Archivist. Distinct voices are selected automatically when available, and visitors operating the presentation can override them in Admin. `SpeechSynthesisVoice.localService===true` is required; if no local voices exist, retain the full text and explain the limitation. Different browsers/operating systems have different voices. No per-play TTS billing.
3. **One-time prerecorded premium speech (production next, no clips bundled yet).** After author/rights approval, render the approved 48 turns once via an affordable cloud TTS provider (e.g. Google Cloud Chirp 3 HD) or on a controlled workstation using Kokoro TTS. Store clips in an access-controlled, rights-cleared audio library. Cache playback by `scene.id + turn index + text hash + voice revision`, never by accession alone. The current implementation does NOT yet fetch/play these clips. Both written tones can be exported separately after approval: `node scripts/export-curated-audio-cues.mjs --tone=critical` and `node scripts/export-curated-audio-cues.mjs --tone=poetic`. Each yields 48 line cues (96 exports total). The unchanged Archivist lines can potentially reuse one master audio clip in a future manifest instead of synthesizing them twice.

### Approximate voice production cost

The approved 48-turn corpus's current *draft* text totals 5,120 characters excluding markup. Google's published Chirp 3 HD list rate is approximately **$30 per 1,000,000 characters after free usage**: at that rate, one complete pass is about **$0.1536** before free allowances, not including any provider billing minimums, voice retries, storage, bandwidth or account setup. 5 revised whole-corpus passes would be about **$0.77** at this unit rate. Google lists a free tier, but its availability and conditions must be confirmed on the active billing account. Commercial rights/terms must be checked independently.

- Primary cloud pricing: https://cloud.google.com/text-to-speech/pricing
- Open-weight Kokoro model and licensing: https://huggingface.co/hexgrad/Kokoro-82M (Apache-2.0 model; **separately verify individual voice data/asset licensing**)
- System voices: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices
- Do not assume that a no-cost voice-cloning offer authorizes cloning a museum employee, artist or historical figure. Prefer obviously synthetic original readings.

**Output step:** `node scripts/export-curated-audio-cues.mjs > curated-audio-cues.json`. This produces the 48 line identities, exact text, SHA-256 prefixes and proposed filenames **without calling a provider or publishing audio**. If any script changes, the filename hash changes, preventing stale or inaccurate voice narration.

## Conversation navigation as a curated exhibition

**UI implementation:** a single collapsed **Explore 16 conversations** guide in the current reading rail, preserving most visual space for the artwork. Visitors can open a chapter, search a title/question, and select the next intended encounter. The five chapters are:
1. Work & Recognition — 6 scenes
2. Machines & Bodies — 2 scenes
3. Political Futures — 4 scenes
4. Images & Desire — 2 scenes
5. Question the Network — 2 scenes

Every entry has an **arc/question**, **two object titles**, and the **actual metadata relation being interrogated**. Selections produce a direct `?scene=<scene.id>` address for internal reviewer collaboration. The URL contains scene IDs, not personal information or permissions tokens.

The navigation engine `src/conversation-guide.mjs` checks `societyView(records, seed, 'family')` at both endpoints for an *already visible* edge with precisely the required `family/value` source tag. When the edge is missing from the current source set, that guide item remains **disabled**, not silently fabricated. Selecting an entry uses the existing 3D graph, its node/edge selection, and the authored conversation engine. Guide navigation uses the Family lens and clears optional theme filters so that the selected pair is actually visible.

The chapters form an **editorial route**, not a claim that records were historically connected. The visitor can return to source details, move through the graph freely, and use Follow this object / Back to previous object.

### Artistically intentional sound

**Do not chase human realism at the expense of meaning.** Assign different sonic personalities that clarify competing positions:
- Object A: observational, slightly slower, grounded; the invitation or proposition
- Object B: contrasting energy/timbre; challenge, reframe or question
- Archivist: deliberate, distinct, restrained; evidence boundary or meaningful refusal

After approval, consider adding a short per-turn silence and simple spatial cue in the prerecorded audio. Avoid continuous autoplay, exaggerated emotional clones, speech over unreadable text, ambient dialogue across all 76 nodes, or cost-bearing API calls on every click. During playback, use the same `turnIndex` event to highlight the exact object/edge and spoken line; the captions remain the primary authoritative text.

## Definition of done for the internal review

- [x] 16 scene IDs visible in 5 themed chapters; search and chapter filter; source-backed destination only
- [x] 3 voice-role selectors constrained to local voices, session-scoped and no automatic remote fallback
- [x] Optional audio-cue export for exactly 48 lines *per tone* (96 possible cues), zero external API calls
- [ ] Browser/Node tests green on latest PR head and deep-linkable navigation verified on 390px phone
- [ ] Artist editorial sign-off on scene wording and voice personalities
- [ ] Optional audio prerecorded and listen-tested, only if time and rights permit
- [ ] Protected preview access and current museum metadata/image redistribution decision (issues #25 / #27)
- [ ] Real projector/phone demonstration of source inspector, Stop, previous/next, and evidence skepticism

## GitHub integration

Stacked on **PR #33** (Conversation Stage, not yet merged): https://github.com/moisestech/wolfsonian-public-api-research/pull/33

Existing gallery QA asset gap: https://github.com/moisestech/wolfsonian-public-api-research/issues/34

**Note:** The existing `data/lakehouse/project-matches.json` and staff tagging corpus in the public repository have unresolved rights review; this branch does not copy them into a new public package or grant redistribution approval. The preview must be access-protected before inviting internal users.
