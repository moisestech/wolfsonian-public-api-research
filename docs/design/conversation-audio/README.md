# Conversation audio editions

**Draft specification for artist review · 22 November 2026.** The existing room player is the product surface. This change supplies the listening specification, casting and production plan, release schema, and an offline inventory. Runtime integration follows review of one complete pilot.

## What a visitor hears

In *When does a promise become a souvenir?*, the visitor can hear the 1939 program address its reader and the 1940 Futurama booklet answer. The same visitor can also hear two present-day hosts examine what those publications promise. The Listen control names the experience before playback starts.

| Choice in Listen | What the visitor hears | What drives the screen |
| --- | --- | --- |
| **Read aloud** · Device | An installed local voice reads the current authored lines in order. Available immediately on a supported device. | Actual utterance start/end and speaker accession. Show turn count. |
| **Hear the scene** · ElevenLabs | A reviewed cast performs the exact object dialogue. The fictional Archivist speaks only at an authored Archivist turn. | The recording's clock, measured duration and verified turn cues. Keep the authored text visible. |
| **Research discussion** · NotebookLM | Two AI hosts discuss this room's approved source brief. Visitors can open the sources and the discussion's own reviewed transcript. | The recording's clock and optional reviewed chapters. Show the host indicator throughout. |

The two objects joined by the edge remain the room's Hosts. The selected perspective and Archivist appear under Listening. Changing perspective can change the reader's question. If the authored script is the same, its performance can keep playing. Contemporary comparisons belong in the listener layer.

## Baseline and dependencies

| Where | What already exists | What implementation must supply |
| --- | --- | --- |
| [Main player](../../../demo/archive-society/society.mjs) and [device cast](../../../src/archive-society.mjs) | Device speech, turn emphasis and Stop. Installed voices and their order can differ across devices. | One selector for the three editions, actual start events, explicit failure handling and local capability detection. |
| [Private voice proxy](../../../server/archive-services.mjs) | An authenticated, opt-in, single-turn ElevenLabs preview. It binds voices to A/B/Archivist on the server and returns transient MP3 bytes. Some errors currently attempt device speech. | Stable object casting, reusable media and publication review. Keep the preview an explicit studio tool. Visitor playback reads published media and offers an explicit alternative on failure. |
| [Audio lab, draft PR #75](https://github.com/moisestech/wolfsonian-public-api-research/pull/75) | Ten fixed-script studies, five early NotebookLM briefs and a local A/B listening room. | Reconcile lab experiment IDs and script versions before importing any existing take. |
| [Language and production planning, draft PR #97](https://github.com/moisestech/wolfsonian-public-api-research/pull/97) | Object voice directions, listener questions, forty planning briefs, five tailored pilot prompts and the source research queue. | Freeze the chosen text and focus prompt for each actual render. Rerun the planner on the editorial revision selected for the pilot. |

The offline preflight on main `3f91342` finds **40 authored scenes across 31 speaking objects**. Ten have museum-published source locators for both objects. Thirty need at least one more primary source for the NotebookLM workflow. An editor must still inspect the linked material and clear its use. An export made outside GitHub may already exist. The release inventory starts empty until an actual file is matched, listened to and cleared.

Five pilot rooms with both recorded editions need ten released masters in one language. The full set of forty would need eighty at that coverage. Switching among the eleven perspectives reuses them. Device reading adds no stored files.

## Requirements and acceptance scenarios

| ID | Visitor or producer requirement | Given / when / then acceptance check |
| --- | --- | --- |
| A1 | Resolve a canonical authored scene and stable speaking identities. | Open a pathway from Townhall, then via its shared URL. Both resolve to the same scene. Reverse a curated edge or change lens. Each line still points to the same object accession and recording. A research prompt with zero authored turns exposes no scripted playback. |
| A2 | Provide three independently available experiences from the existing Listen control. | With a local voice and two matching releases, the chooser lists all three. With one release it lists that recording and any available device option. With neither an installed voice nor a recording, offer the written text. A card advertises a recording only when an applicable release exists. |
| A3 | Keep device reading local and usable across devices. | Wait for available voices, including `voiceschanged`. Select a local voice matching the language when possible. One compatible voice can read multiple speakers with displayed labels. If the only voices are remote or unavailable, retain the text and offer any released recordings. Reading makes zero project/provider requests. |
| A4 | Bind a performance to exactly what is spoken. | Change a word, the turn order or the identity of the speaker. The old performance becomes ineligible for that revision. Changing a card title or listener/UI theme leaves the performance eligible. A source-brief edit independently triggers review of the discussion. |
| A5 | Keep timing and attribution faithful. | Seek through dialogue, a pause and a chapter. Highlight only the verified object/Archivist at the media time. During silence clear the highlight. An empty cue list plays without highlighting. A NotebookLM take always uses its own accessible transcript and never lights an object as its narrator. |
| A6 | Make playback deliberate and interruptible. | Open a link, use Back or switch editions. The chosen view is idle. Starting a different room stops the old transport and ignores any late callback. Opening Record/Evidence pauses a recording and retains its position in that room for explicit resume. Device speech can restart the interrupted turn. Replay starts at the beginning. |
| A7 | Release edited media from a controlled manifest. | A draft, rejected, withdrawn, mismatched, unreviewed or inaccessible asset produces no playable entry. A missing file, failed Range request or media error leaves the transcript available and offers another available edition with a tap. No visitor action submits source material or triggers a paid render. |
| A8 | Bound production cost and make jobs repeatable. | Two requests for the same approved inputs and take reserve one job. Restarting after a lost provider response requires reconciliation before another paid call. An explicit retake consumes a new reservation. Refuse work exceeding the configured project or batch ceiling. |
| A9 | Keep playback accessible and compact. | At 320px, 390px and desktop, use the existing Listen action and rail with keyboard-operable controls, readable mode labels and light/dark contrast. Recorded media supports pause, seek and elapsed/total time. Respect reduced motion. Stop updates speaking state immediately. Screen readers can reach both texts without playing audio. |
| A10 | Identify the speakers and the authorship of each edition. | Before Play, identify the ElevenLabs version as an AI performance of an imagined exchange. Identify the NotebookLM voices as two AI research hosts and link the sources. Make these labels available to screen readers. An object speaking in the first person carries the scene's existing interpretation credit. |

**First-use default proposed for review.** When a released performance exists, preselect Hear the scene. Otherwise preselect Read aloud if available, then a released Research discussion. Selection alone is silent. On phones Listen opens the compact chooser. A labeled Play starts the selected edition. Desktop uses the same choices at the existing transport. Preserve the current room and lens URL contract. If edition deep links are introduced, accept only the three known edition keys, restore the selection idle, and keep playback time in the session.

## Identifying the correct take

Use `conversation.sceneId` for `CURATED_EDGE_SCENE` and `conversation.id` from `juxtapositionConversation(path)` for `CURATORIAL_JUXTAPOSITION`. The latter currently produces an episode whose UI ID can fall back to a sorted accession pair. The production index must use the authored path ID. A pair, a title or “02” alone cannot distinguish all scripts for the same objects.

For the performed scene, `scriptRevision` is the lowercase SHA-256 of UTF-8 `JSON.stringify(["archive-society/audio-script/v1", sceneId, language, orderedLines])`. Each line is `[speakerKey, exactSpokenText]` in authored order. An object speaker key is `object:<exact accession>`, including punctuation such as the comma in `85.7.383a,b`. An authored Archivist turn uses `perspective:archivist`. Each cue addresses `(scriptRevision, turnId)` where the first turn is `t001`. Display positions A/B and the currently selected lens stay outside the digest.

On the audited main revision, `program-and-booklet` has three turns, with `86.19.57`, `XB1992.1640` and `86.19.57` speaking in that order. The eight-turn `02-promise-souvenir` study in PR #75 is a related, separately authored script. It can enter the audition room as a study. To attach its performance to the visitor transcript, first select that exact script as the new authored revision or render the approved three-turn text.

For a NotebookLM release, `basisRevision` identifies the exact approved source brief, supplied sources, prompt, format and language. A wording edit confined to an object line leaves that discussion eligible if its source brief still applies. The [production plan](production.md) defines rerenders, review, storage and withdrawal.

## Delivery and verification

| Increment | Deliverable | Acceptance before the next increment |
| --- | --- | --- |
| 0 · Specification and inventory | This proposal, [release schema](release.schema.json), [offline planner](../../../scripts/plan-conversation-audio.mjs), [identity tests](../../../test/conversation-audio-plan.test.mjs) and [release contract tests](../../../test/test_conversation_audio_release.py). | Type a canonical scene ID and inspect its hosts, exact transcript revision, source gaps and estimated character count. Run the checks below. |
| 1 · One private listening comparison | Moises chooses the pilot text, auditions the cast and sets the credit ceiling. Import an existing matched NotebookLM export if available and prepare one reviewed ElevenLabs take. | Compare device, performed scene and discussion on the same question. Verify words, source claims, pronunciation, phone intelligibility and attribution. |
| 2 · Player and first release | Add the per-scene manifest resolver, edition chooser, separate transports and release validation with one cleared pair. | Automate A1–A7 and A9–A10 with mock providers or local fixture audio. Test real playback and focus on an iPhone. Compare the delivery manifest, transcript and media hashes before publishing. |
| 3 · Batch production | Add durable job reservations, retries/reconciliation, an import command, budgets and a review queue. | Demonstrate A8 with concurrent requests, a timeout, an exhausted budget and a deliberate retake. Expand to the other four pilots, then the next five source-located pairs. The source research queue controls the rest. |

```sh
node scripts/plan-conversation-audio.mjs
node scripts/plan-conversation-audio.mjs program-and-booklet
node scripts/plan-conversation-audio.mjs --all
node --test test/conversation-audio-plan.test.mjs
python -m unittest discover -s test -p test_conversation_audio_release.py
```

The Node checks exercise room identity and source planning against the actual registries. The Python contract tests use `jsonschema` 4.x to validate example entries offline. Playback, provider generation, measured timestamps, billing and listening quality have their own acceptance work in increments 1–3.
