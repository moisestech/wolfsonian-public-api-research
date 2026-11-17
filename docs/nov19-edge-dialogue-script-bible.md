# Archive Dreams in Public — Nov 19 Edge-Conversation Script Bible

**Date:** November 17, 2026  
**Branch:** `feat/nov19-curated-edge-dialogues-20261117`  
**Status:** PRIVATE-REVIEW INTENDED, BUT THIS GITHUB BRANCH IS PUBLIC; do not add any unpublished staff/private notes to this file. All dialogue is original artist-authored fictional interpretation, not a quote from 1917–1944, a museum statement, or an assertion of a historical meeting.

## The commissioning brief

The exhibition's artificial society should make a claim, meet resistance, and invite verification. A connection is an **invitation to investigate**, not proof. The dramatic structure for each conversation is: **different stakes for object A → object B changes or challenges the premise → fictional Archivist names the exact evidentiary boundary → visitor chooses what to test next**. Every edge needs a distinct question; not every edge deserves to survive the test.

We are writing for **internal colleagues on Thursday, November 19, 2026**, with text-first fallback and optional device audio. Target ~20–35 seconds of spoken text per curated scene, then pause for visitor choice. The visitor, not an automatic agent, should select whether to play another edge.

## What the actual main branch contains

- `data/lakehouse/project-matches.json` has **76 matched records**, drawn from a bounded saved lookup. `src/matrix-objects.mjs` has **300 staff-tagged object candidates**. These are in a PUBLIC repository with redistribution approval **not established**; issue #25 remains open. This script does not authorize public publication of either dataset.
- The 76 matched records yield **1,104 distinct undirected shared-tag pairs** when any theme or motif matches. This is an aggregate research count, not 1,104 demonstrated/approved historical connections.
- The active `societyView(...)` displays **up to six** candidate edges around one selected object. Selection is based on persona-ranked shared metadata and diversity of object type.
- The default opening is `85.4.64.34`, *On Munitions: Skilled Work*. Its six current `family`-lens neighbors are: `TD1989.317.66`, `XX1990. 3722`, `TD1990.340.141`, `85.4.64.43`, `XX1990.4091`, and `84.4.157`. This order is a current data observation; changes in source content, mode or lens may change the visible edges.
- `src/presentation-pairs.mjs` contains 12 curated candidate pairs; all 24 endpoints match the saved 76 records, but that file is not itself a conversation registry. The union of the 12 candidates with six current opening edges produces **16 distinct scene pairs**.
- `XM1999.108.8` *Machine-Age Exposition* has a separate source-first visitor question engine but may be an **identity-only node** in the Atlas if its metadata-backed pair isn't in the saved graph. Do not create a spurious tag edge to force it into the society. Distinguish this visitor encounter from the On Munitions graph opener.

## Dramaturgical principle: meaningful disagreement, not three copies of the same line

Every scripted edge has a specific contrast:

1. **Work versus recognition** — the names, invisibilities and claims of labor.
2. **A promise versus its cost** — machinery alongside care and risk.
3. **Image versus political address** — portrayal, persuasion, audience, speech.
4. **A remembered past versus a proposed future** — dates used as rhetoric.
5. **A suspect connection** — the machine notices its own shallow match and invites a visitor to reject it.

The fictional Archivist does not always end with “a shared tag is not history.” Instead, the Archivist should precisely identify the **kind of unsupported leap**: same factory, ideology, publisher, visual influence, historical causality, original audience, or rights. Avoid impersonating original makers or claiming catalog metadata provides testimony about feelings or labor conditions.

## Coverage matrix

| # | Source ↔ target accession | Indexed overlap | Dramatic function | Group |
|---|---|---|---|---|
| 01 | `85.4.64.34` ↔ `TD1989.317.66` | Women (motif) | Who gets credit for labor? | Opening |
| 02 | `85.4.64.34` ↔ `TD1990.340.141` | Women (motif) | Who gets represented as the worker? | Opening |
| 03 | `85.4.64.34` ↔ `85.4.64.43` | Factories (motif) | What does making hide? | Opening |
| 04 | `85.4.64.34` ↔ `XX1990.4091` | Factories (motif) | Representation versus agency | Opening |
| 05 | `85.4.64.34` ↔ `84.4.157` | Labor (theme) | A future separated by twenty-two years | Opening |
| 06 | `85.4.64.34` ↔ `XX1990. 3722` | War / Military (theme) | From production floor to aerial spectacle | Opening |
| 07 | `85.4.64.43` ↔ `TD1989.318.1` | Machines (motif) | The machine meets the body | Chapter |
| 08 | `XX1990.4091` ↔ `85.4.64.43` | Factories (motif) | Labor as political address | Chapter |
| 09 | `84.4.157` ↔ `XX1990.2907` | Political symbols (motif) | Dates deployed as arguments | Chapter |
| 10 | `XX1990.3843` ↔ `84.4.157` | Political symbols (motif) | Whose collective future? | Chapter |
| 11 | `84.4.66` ↔ `XX1991.13` | Trees (motif) | Challenge algorithm | Chapter |
| 12 | `84.4.25.1` ↔ `XX1990.3275` | Mythological figures (motif) | Images move between art and commerce | Chapter |
| 13 | `TD1990.340.146` ↔ `84.4.157` | Flags (motif) | Who has a claim on the future? | Chapter |
| 14 | `XX1990.2870` ↔ `83.4.40` | Water (motif) | Challenge algorithm | Chapter |
| 15 | `XX1990.2880` ↔ `84.4.157` | Flags (motif) | Future promised or threatened | Chapter |
| 16 | `XX1990.3277` ↔ `84.4.25.1` | Mythological figures (motif) | A shared figure, two kinds of attention | Chapter |

## Scripts for curatorial review (16 pairs)

### 01. Who gets credit for labor? — `85.4.64.34` ↔ `TD1989.317.66`

**Metadata link:** Women (motif); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** My title calls munitions work skilled. Why does the word skilled need to be announced?

**Object B:** My title advertises a lottery tied to an exhibition of women's labor. Is making work visible the same as valuing the people who do it?

**Archivist:** The records share the Women motif and Labor theme. They do not establish a common workforce, audience, or historical collaboration.

**Visitor choice:** Which source could tell us who was paid, named, or invited?

**Editorial limit:** Start with this pair: two different ways of staging and recognizing women's work.

---

### 02. Who gets represented as the worker? — `85.4.64.34` ↔ `TD1990.340.141`

**Metadata link:** Women (motif); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** I tie skilled work to munitions. Does the job become visible, or only the national need for it?

**Object B:** I announce an exhibition called The Woman 1813–1913. Who decides which kinds of work deserve a public exhibition?

**Archivist:** The Women motif connects these records. Their different dates and purposes are grounds for comparison, not proof of a shared cause.

**Visitor choice:** What would their actual captions reveal about the intended audiences?

**Editorial limit:** Do not turn the two exhibition or production contexts into one historical narrative.

---

### 03. What does making hide? — `85.4.64.34` ↔ `85.4.64.43`

**Metadata link:** Factories (motif); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** Skilled work appears in my title. Can production be celebrated without naming the people doing it?

**Object B:** I am titled Making the Engine. What happens when a machine becomes the hero of the image, rather than the act of making it?

**Archivist:** The Factories motif is shared. It does not establish the same factory, workers, or a connection between the makers of these prints.

**Visitor choice:** Which record would identify an actual worker behind either image?

**Editorial limit:** Same-era production imagery; do not infer direct artist influence.

---

### 04. Representation versus agency — `85.4.64.34` ↔ `XX1990.4091`

**Metadata link:** Factories (motif); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** My title asks the viewer to notice skilled work on munitions.

**Object B:** My title asks people to vote for a workers' party. When does being pictured as labor become having a political voice?

**Archivist:** Factories is the shared motif. We can compare the requests these titles make without claiming a common movement or campaign.

**Visitor choice:** Whose voice is centered in each publication?

**Editorial limit:** Keep political interpretation critical and nonpartisan; avoid claiming artist endorsement.

---

### 05. A future separated by twenty-two years — `85.4.64.34` ↔ `84.4.157`

**Metadata link:** Labor (theme); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** My 1917 title names munitions as skilled work. Does a wartime need change how skill is celebrated?

**Object B:** I am titled 1939 A.D. What does that date do to the earlier image's confidence in work and progress?

**Archivist:** Labor is the common category. The records' dates establish distance, not a documented causal chain.

**Visitor choice:** What contemporary account from 1939 would change this reading?

**Editorial limit:** A temporal juxtaposition, not historical continuity.

---

### 06. From production floor to aerial spectacle — `85.4.64.34` ↔ `XX1990. 3722`

**Metadata link:** War / Military (theme); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** My title stays close to the work of making munitions.

**Object B:** My title places a Savoia-Marchetti aircraft above Rome's Colosseum. What changes when technical power is seen from above rather than from the workshop?

**Archivist:** War / Military is the shared category. It does not place the two images in one program, conflict, or propaganda campaign.

**Visitor choice:** What does each viewpoint invite us to see—and not see?

**Editorial limit:** The flying-over-Colosseum wording comes from its catalogue title, not a reviewed photograph.

---

### 07. The machine meets the body — `85.4.64.43` ↔ `TD1989.318.1`

**Metadata link:** Machines (motif); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** Making the Engine is my title. Does the act of making disappear when the engine becomes the subject?

**Object B:** My warning says one splinter can cost an eye. What is progress worth if the worker's body carries the risk?

**Archivist:** Machines is the shared motif. That justifies comparison, not a claim that the two images depict the same industry, location, or incident.

**Visitor choice:** Which safety record or workplace account would complicate the picture?

**Editorial limit:** A key dramatic counterweight: productivity vs. bodily risk.

---

### 08. Labor as political address — `XX1990.4091` ↔ `85.4.64.43`

**Metadata link:** Factories (motif); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** My title instructs viewers to vote for a workers' party. Can an image speak for labor?

**Object B:** I depict engine-making by title. What is the difference between showing people working and hearing what they demand?

**Archivist:** Factories is the repeated motif, not a proven relation between the parties, artists, or workers represented.

**Visitor choice:** What would a contemporaneous worker's account add?

**Editorial limit:** Political poster is an address to a viewer; title evidence does not establish reception.

---

### 09. Dates deployed as arguments — `84.4.157` ↔ `XX1990.2907`

**Metadata link:** Political symbols (motif); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** My title names 1939 A.D. Can a year stand in for a prediction about what comes next?

**Object B:** Mine insists that 1943 is not 1918. Why would a poster need to argue with a previous year?

**Archivist:** The Political symbols motif links the records. Nothing here proves a shared speaker, ideology, or direct historical response.

**Visitor choice:** Who was being addressed by each date?

**Editorial limit:** Do not conflate disparate political contexts.

---

### 10. Whose collective future? — `XX1990.3843` ↔ `84.4.157`

**Metadata link:** Political symbols (motif); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** My title says The Effect of Our U-Boats. Who is invited into that word our?

**Object B:** Mine names 1939 A.D. Does a date address everyone equally, or a particular imagined public?

**Archivist:** Political symbols is a staff-assigned connection. This is a comparison of how titles speak, not a common campaign.

**Visitor choice:** Can a source identify the original intended audiences?

**Editorial limit:** Treat wartime publicity as an object of analysis, not a statement to endorse.

---

### 11. When the algorithm should doubt itself — `84.4.66` ↔ `XX1991.13`

**Metadata link:** Trees (motif); classification `shared_staff_metadata`. **Mode:** question_edge. **Readiness:** editorial draft, not institutionally approved.

**Object A:** My record names Paul Robeson. Why should I be connected to an architectural fantasy?

**Object B:** My record describes a house on a steep hillside. Is the shared Trees motif enough for us to claim a conversation?

**Archivist:** No documented historical relationship is established. Trees is a metadata overlap. This might be a useful failed hypothesis, not a meaningful historical edge.

**Visitor choice:** Keep the comparison as a question, or withdraw this edge?

**Editorial limit:** Intentional failed match; do not coerce emotional or racial meaning from a tree tag.

---

### 12. Images move between art and commerce — `84.4.25.1` ↔ `XX1990.3275`

**Metadata link:** Mythological figures (motif); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** I announce an international exhibition of contemporary art. What makes an image appear worthy of attention?

**Object B:** My title advertises a dye. What happens when a similar mythological motif enters an industrial advertisement?

**Archivist:** Mythological figures is the shared motif. Resemblance does not establish copying, influence, or a shared designer.

**Visitor choice:** What changes when an image persuades a consumer rather than an exhibition visitor?

**Editorial limit:** Require visual check before stating motif's form or composition.

---

### 13. Who has a claim on the future? — `TD1990.340.146` ↔ `84.4.157`

**Metadata link:** Flags (motif); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** My title demands that the East Indies be free and urges people to work and fight for it. Who is being summoned?

**Object B:** My title gives us a year, 1939. Can a date answer a later political demand?

**Archivist:** Flags is the shared motif. Do not merge these distinct political contexts or infer ideological alignment.

**Visitor choice:** What would each object's publisher and audience clarify?

**Editorial limit:** Sensitive political histories require verified context before specific interpretive claims.

---

### 14. A false-looking bridge — `XX1990.2870` ↔ `83.4.40`

**Metadata link:** Water (motif); classification `shared_staff_metadata`. **Mode:** question_edge. **Readiness:** editorial draft, not institutionally approved.

**Object A:** I announce the 10th Utrecht Fair. Why has this graph connected me to Let the Living Rise?

**Object B:** The metadata says we share Water. But what do our titles actually tell us about a common purpose?

**Archivist:** Not enough. A repeated motif does not establish intention, contact, or a historical relationship. The proposed edge remains unproven.

**Visitor choice:** Would you inspect the objects further—or reject this connection?

**Editorial limit:** A deliberately self-critical match, useful as the machine recognizing its limits.

---

### 15. Future promised or threatened — `XX1990.2880` ↔ `84.4.157`

**Metadata link:** Flags (motif); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** My title describes an invader's grasp and a threat of enslavement. What future is being feared?

**Object B:** I am titled 1939 A.D. Can a future be an expectation for one audience and a danger for another?

**Archivist:** Flags is the shared category. It does not support a claim that the two works spoke to the same event or audience.

**Visitor choice:** Whose perspective would another document restore?

**Editorial limit:** Do not attribute politics beyond title and checked sources.

---

### 16. A shared figure, two kinds of attention — `XX1990.3277` ↔ `84.4.25.1`

**Metadata link:** Mythological figures (motif); classification `shared_staff_metadata`. **Mode:** contest. **Readiness:** editorial draft, not institutionally approved.

**Object A:** My title promotes Pirelli heels. Can an image make a commercial object seem extraordinary?

**Object B:** I announce a biennial exhibition. Why would the same motif appear in a product image and an art exhibition poster?

**Archivist:** The shared Mythological figures tag creates a comparison. It does not establish borrowing, influence, or collaboration.

**Visitor choice:** What does the motif ask different viewers to desire?

**Editorial limit:** Visual motif must be checked before claims about its appearance.


## Runtime rules for every edge, including the other candidate pairs

**Tier A — 16 curated pairs:** Identify the unordered pair by exact normalized accessions. **Require the actual edge reasons to include the cited metadata family/value**; only then use the authored scene. Reversing selected source and target must not put one object's script in another's mouth. Keep source and target accession IDs visible even if their titles are shortened. The visible speaker can be the record title as a fictional character but never a historic person quoted without source.

**Tier B — unscripted but meaningful metadata comparison:** When a pair shares a specific theme and/or motif, show (a) the exact recorded overlap, (b) an object-specific question built from the two catalog titles and their *different* roles, (c) why the overlap is a hypothesis rather than a verified relation, (d) a plausible source to investigate. Don't repeat the generic “Our records meet at category …” template on every edge. Tag frequency is a discovery score, **not credibility**.

**Tier C — weak or surprising comparison:** If the pair shares only a generic motif, e.g. Trees or Water, ask whether the proposed connection should exist at all. Encourage “Keep as question / Need another source / Withdraw edge” as visitor actions. Never promote an unexpected overlap into a verified cultural or causal relationship just to create an engaging line.

**No supported edge:** Do not fabricate one. Display identity and a clearly labeled unanswered comparison question or ask visitors to switch objects.

## Five-stage visitor experience and narrative path

1. **Encounter:** Start on `85.4.64.34`, display a legible title, year and category. The visitor sees six neighboring records, not 1,104 lines.
2. **Conversation:** Select an edge; show ~3 speaking turns as a dramatic disagreement. The narrator/Archivist discloses the overlap type. Optional local voice only with transcript and Stop.
3. **Challenge:** “Why are these related?” reveals exact tags, source columns, accession IDs, and whether this relation is metadata-only or corroborated. A response should never pretend that the catalogue or a witness literally spoke.
4. **Visitor agency:** Offer “Follow this object,” “Inspect source,” and “Question this link.” A new selection changes the conversation stakes; avoid unsolicited three-object monologues.
5. **Institutional correction:** A curator can qualify, withdraw or retain an interpretive edge once they inspect an additional source; **do not** quietly change staff taxonomy or claim human review occurred where it has not.

A coherent demo route using the ACTUAL visible edge navigation: **On Munitions → Women's Labor (recognition) → back to the On Munitions hub → Making the Engine (production) → Grind Safely (risk)**. Returning to the hub is intentional: the Women's Labor record does not currently offer Making the Engine among its six `family`-lens neighbors. For the separate self-critical scene, select Paul Robeson (`84.4.66`) as the seed and follow its Trees-tag edge to the architectural fantasy; select Utrecht Fair (`XX1990.2870`) to reach the Water-tag challenge. These are valid shared-tag edges, not documented historical relationships. The first leg and latter leg are each metadata-backed pairs but the route as a whole is **an artist-curated interpretive sequence**, not a documented historical network.

## Data, rights, and safety decisions for Thursday

- The Wolfsonian's Machine Age catalogue is **on view**, not accessible for page inspection; external scans and review text belong to separate sources.
- No new images, unapproved staff descriptions, private annotations, leaked lookup response content, box numbers, or hidden institutional metadata should be committed.
- `src/curated-edge-scenes.mjs` contains **only original scripted dialogue, accession references already present in the repo and the shared tags needed to gate it**. Its existence does not grant publication rights to the matrix or saved Lakehouse dataset. Internal-only access should be enforced at deployment, not assumed from a public URL.
- For political or propagandistic titles, the fictional readers investigate persuasion and audience; they do not endorse a movement or assert unverified historical alignment.
- Each scene should be reviewed by the artist before activation, especially `TD1990.340.146` (East Indies freedom), `XX1990.3843` (U-boats), `XX1990.2880` (Italian invasion) and `84.4.66` (Paul Robeson).

## Engineering implementation and QA criteria

- Wire `sceneForConfirmedEdge(sourceAccession,targetAccession,edge.reasons)` into `src/archive-society.mjs::conversationFor` as the first dialogue path. Preserve the existing generic engine as a safe fallback; no model calls required.
- In `demo/archive-society/society.mjs`, display scene arc and visitor continuation question above provenance panel. Mark `ARTIST-AUTHORED SCENE` vs `METADATA-BASED FALLBACK`.
- Update the localhost server module allowlist for the new source module. For a static deploy, the Vercel/Pages artifact must include that module and all imports, but do not activate a public build until issue #25 is addressed.
- Test all 16 pairs in both directions; ensure source/target voice roles remain truthful; refuse script if reason family/value absent, even if pair IDs match; prevent accidental matching on substring/prefix accession IDs.
- Browser-test the six **actual** `On Munitions` opening edges on 390×844 mobile and the internal laptop; verify skip, Stop, and source inspector. Check two weak cases display explicit doubt.
- No scripted claim should be presented as an unqualified collection fact without an approved source pointer. “Keep / qualify / withdraw / unresolved” are proposed visitor/reviewer actions, not database mutations.
- Record one 90-second path and a short offline screen capture. Do not replace working Nov 19 fallback with untested generative multi-turn conversation.

## Release criterion

**Success:** an internal visitor opens the exhibition, selects a meaningful edge, hears two different stakes and the source boundary, and understands *why this object relationship was proposed* and *what would change that interpretation*. A weak edge teaches something by openly failing its own test.

**Not sufficient:** 16 captions, 16 generic tag descriptions, 1,104 automatic dialogue monologues or a green CI status without a real visitor rehearsal.

## Relevant code and issues

- Curated executable draft: [src/curated-edge-scenes.mjs](../src/curated-edge-scenes.mjs)
- Current default engine: [src/archive-society.mjs](../src/archive-society.mjs)
- Existing shared-tag candidates: [src/presentation-pairs.mjs](../src/presentation-pairs.mjs)
- Generic matrix dialogue: [src/matrix-room.mjs](../src/matrix-room.mjs)
- Source distribution gate: [issue #25](https://github.com/moisestech/wolfsonian-public-api-research/issues/25)
- Deployment access/preview: [issue #27](https://github.com/moisestech/wolfsonian-public-api-research/issues/27)
- Longer multi-turn director: [issue #30](https://github.com/moisestech/wolfsonian-public-api-research/issues/30)
