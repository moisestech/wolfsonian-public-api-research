# Question-led conversation rooms

Implements the first-screen direction in RFC #50 and roadmap #49. The room asks a human question before presenting the exchange. All voices remain artist-authored fiction. No live conversation, new model integration or physical storage mapping is introduced.

## Architecture

The existing `conversationFor()` and `juxtapositionConversation()` functions remain the source of authored scripts and comparison metadata. `conversationEpisode()` in `src/conversation-orientation.mjs` adapts them into one view model consumed by both the room and the question list.

| Layer | Responsibility |
| --- | --- |
| Episode identity | Stable scene ID or exact accession pair; independent of the selected reading lens |
| Topic | Editorial question; never written back as a catalog field |
| Participants | Exact accessions, unmodified catalog titles, separate short editorial display names |
| Relationship | Shared tag or explicit artist proposal; no historical contact or storage claim |
| Scene mode | Authored script with playable turns, or research prompt with no fabricated dialogue |
| Evidence | Current pair, original titles and exact records; interpretation and source limits remain inspectable |
| Views | Phone conversation room; desktop graph plus persistent rail; question list |
| Transport | One Play/Stop action, active object emphasis, cancellation when the selected pair changes |

X Spaces informs the topic, participant identities, speaking emphasis and transport. WhatsApp informs the ordered readable transcript and the ability to browse another thread. These are UI references, not live-service semantics: no fabricated listener counts, timestamps, delivery receipts or microphone permissions.

## Selection logic

Selecting a graph neighbor or a question stops existing audio, selects the actual edge, and renders its episode, participant identities, comparison rationale and transcript together. The graph highlights the same accession pair. Opening either participant's Record changes only the inspected accession, not the selected episode. Returning to Conversations restores that room.

A reading perspective can change recommendations. It does not rewrite the authored script for the same selected pair. The Evidence panel explains this. Source status distinguishes local input, staff metadata, artist proposal and unresolved basis; a tag never upgrades to verified catalog evidence.

Unedited pairs show an open research prompt and exact-record actions. Their underlying legacy template is not presented as a bespoke drama or played. Existing curated scripts are preserved, including their source-boundary turns; further dramaturgical edits belong to source review #44.

## Screen hierarchy

The phone opens the current room: IMAGINED EXCHANGE → question → two compact object cards → one-line rationale → transcript. All questions opens the question list; Map opens the existing conceptual graph. The four-control public header remains intact. Evidence opens the selected-pair explanation and exact-record actions.

On desktop, the graph remains alongside a bounded rail. The topic and playback controls remain in place while the transcript scrolls. Short screens reflow into a scrollable room so enlarged content remains reachable.

## Visitor participation: chosen direction

Moises chose **Ask their own question** for the next layer. That layer is not implemented in this first-screen change. Reuse Object Lens' source-bounded typed-question contract rather than creating a second conversation engine:

1. Resolve the exact selected object or pair to a reviewed source packet.
2. Accept the visitor's question and keep it in session memory only.
3. Route supported questions to source-linked responses; explicitly mark interpretation and unresolved claims.
4. Unsupported questions remain NOT ESTABLISHED and offer follow-up research directions.
5. A change in speaker perspective can offer a counter-reading while preserving the same question and source identities.

Initially enable this only for accessions with reviewed packets, starting with the existing Machine Age catalogue prototype. The engine/safety room needs its own source packet before factual open-ended answers can be offered. Any future language-model or external voice work requires its own source/privacy contract; audio rendering alone does not create a live autonomous conversation.

## Verification

The focused unit suite covers episode/pair identity, unchanged scripts across lenses, truthful fallbacks, original titles, metadata status and fictional boundaries. Browser checks cover two complete first messages at phone/tablet sizes, desktop layout, record inspection without recentering, pair switching, no autoplay, playback cancellation, XSS/service boundaries, Map, reduced motion and a half-sized viewport equivalent to 200% desktop zoom. Screenshot artifacts are captured at 320, 390, 768 and 1280 px.

The repository's older matrix-room test expected three turns although main's existing comparison engine returns five. Its assertion is updated to check the complete role sequence and the archivist's source boundary. No dialogue engine behavior changes.

Physical Safari/VoiceOver, projector/audio rehearsal, five-person cold-visitor evaluation and institutional source/reuse review remain human checks. Automated layout checks do not establish visitor comprehension or curatorial approval.
