# Conversation Stage — November 19 internal interaction pass

## Design objective
**Make the conversation visible before asking people to interpret the network.** A viewer should know within two seconds **which two objects are connected, who has the floor, what that object says, and which recorded label created this edge**. The work is an artificial society with an accountable archive, not a tiny chat window next to a mysterious graph.

### Design simplification
Keep one spatial field and one reading stage. The existing two-pane Atlas remains: graph on the left, conversation on the right. Remove the redundant mini-object portrait strip entirely; the graph now displays the two participant titles in a compact overlay while the Archivist remains a distinct fictional speaker in the transcript. Preserve exact accession IDs, source inspector and synthetic/real data boundary. Don't add a new mode, modal, autoplay, transcript upload, or LLM.

- **Spatial field:** selected pair remains fixed and emphasized in Three.js. The currently focused object gets a distinct blue/amber halo; a small dot travels along the actual selected pair link while a visitor reads its line. During the Archivist's turn the dot pauses at the midpoint. The dot is **narrative emphasis**, not a claim of measured data transfer. With reduced-motion enabled it remains stationary.
- **Reading stage:** the active turn is the largest line on the page (22–27px Georgia), while all other turns remain completely readable and available (16–19px). No word-by-word typewriter or auto-scrolling. Every turn labels **OBJECT A**, **OBJECT B**, or **THE ARCHIVIST**, with image, name, and distinct color. First turn is focused by default.
- **Explicit pacing:** Previous / Next controls are always in the top of the conversation panel while there is a dialogue, with accessible Reading n of 3 status; keyboard focus remains predictable. All text is present immediately; readers choose pace. Separate optional **Play/Stop** remains available and advances the same focused line in sync with voice.
- **Evidence boundary:** original source-column inspector and the banner **Interpretation is not evidence** remain; authored/metadata-only labels and source-gating logic are untouched.

## Implementation
- `demo/archive-society/index.html`: stable navigation and audio controls above the transcript.
- `demo/archive-society/society.css`: widen conversation stage on desktop; eliminate duplicate photo strip, add a compact graph conversation identity overlay and mobile 'Read the dialogue' jump; improve type scale/contrast, active turn states and reduced-motion behavior.
- `demo/archive-society/society.mjs`: `turnIndex` and `turnKey` for within-scene reading focus; source/target/Archivist roles mapped to the graph; Previous/Next; local voice moves the same focus state; hover stops redrawing while voice is playing.
- `demo/force-stage.mjs`: new `setActiveSpeaker(id, role)` updates node identities in the graph's accessible controls; visible speaker halos and a subtle moving dialogue signal along the selected pair, never a fabricated historical edge. `#graph-dialogue-label` identifies the current two records and focused fictional voice as text, including when node images are absent.
- `scripts/check-society-browser.mjs`: Chromium checks type scale, 3 turn changes, source/target speaker identifiers, mobile legibility, reduced motion, and no horizontal overflow in addition to existing six edge scripts / privacy tests.

## Intended physical staging
At 1600px desktop the conversation side is roughly 42% of the width, not a 340–400px afterthought. On a phone, the graph is compact (roughly 240–310px tall) with a native 'Read the dialogue' link so the reading stage is immediately discoverable. The data-source inspector stays accessible. For an external wall in a museum, test the actual viewing distance; a dedicated projection/large type mode is a later phase, not silently assumed complete by web breakpoints.

**Suggested walkthrough (45–90 sec)**
1. Open **On Munitions: Skilled Work**; show the two active objects and colored graph halos.
2. Read line 1 about production. Use Next; the amber ring and traveling signal shift toward the other record.
3. Next to Archivist; the focus switches from a character to a source-boundary question, with dot paused between objects.
4. Open **Inspect the reason for this edge**. Explain why a shared metadata tag is not an established historical relationship.
5. Follow the target, navigate back; optionally Play/Stop the already displayed script. No external model is required.

## Release acceptance
- Active speech typography >=22px desktop; >=21px on 390px mobile. Other turns stay visible.
- Keyboard Previous/Next changes `aria-current`, the reading status, and the graph's active object ID.
- Source/target switch accurately; Archivist never impersonates a collection object.
- Reduced-motion turns off focus and dot animations; evidence always available as static text.
- Existing source-only voice policy, failed-provider fallback, navigation, dangerous HTML fixture, and private server route checks remain green.
- No new museum field, object image, AI service, or full historical text is introduced by this UI-only branch.
- Internal deployment still depends on the institution's metadata/image rights review (#25) and actual Vercel access verification (#27); green build is not human signoff.

Do not merge only because it looks visually polished: inspect real Chromium screenshots for the default edge and 390px mobile, and rehearse on phone/projector.
