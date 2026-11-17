# Machine Age Exposition — first source-backed visitor encounter
*Archive Dreams in Public · Independent artist research · 2026-11-16 · working draft, not museum approval*

## The scene
A visitor identifies the Machine Age Exposition catalogue, accession XM1999.108.8, and must manually confirm the identity. The visitor chooses a prepared question and one of three **fictional** readers. A source-limited answer appears, with relevant facts traceable to the Wolfsonian's own modern-design exhibition checklist and open questions clearly marked. Switching readers changes what is asked of the evidence, not the evidence itself.

## What has actually been checked
**Institutional source:** The Wolfsonian–FIU, *Modern Design Across Borders* exhibition checklist:
https://wolfsonian.org/_assets/docs/checklist_modern-design-across-borders.pdf

**Location within source:** Section *Streamlining Transportation* → entry *Catalogue, Machine Age Exposition*, 1927.

The public museum checklist supports the catalogue's title, 1927 date, New York City attribution, accession XM1999.108.8, 11 × 8¾ in dimensions, collection attribution, Fernand Léger as cover designer, publisher Jane Heap as initiator of the international exhibition, mechanical beauty/streamlined forms as the Wolfsonian's present curatorial reading, and essays by Enrico Prampolini and Alexander Archipenko on machines and art.

**Not inspected as a primary document:** Full original 1927 catalogue pages, image reproductions beyond the official checklist, exact essay wording, Hugh Ferriss's foreword, original printing credits, labor identities, installation/box location, current display placement, or permissions to reuse scans.

The existence of independent online transcripts is **not** sufficient to assign an original page pointer or quote a museum copy. Ask library/collections staff to verify these items before promotion or a generated conversation.

## Data model and editorial responsibilities
Source of truth: src/machine-age-research.mjs
- source id WOLF-EXH-2025-MDAB
- 10 explicit claim IDs MA-001 through MA-010
- claim kinds/status: source_fact, linked to an institutional exhibition source locator
- editorial status: artist_research_not_museum_reviewed
- rights: facts-only; image use not cleared
- 6 question topics and 18 fictional persona-specific responses
- 4 unresolved research tickets
- no museum photos, restricted metadata, fabricated historical quotations or external API calls

Source-bound answer generation:
1. Exact accession and a supported reader selected.
2. Select one of six prepared questions.
3. Retrieve only claim IDs from the verified source ledger.
4. Validate each claim is present with source status public_source_checked.
5. Display narrative as artist-authored interpretation; provide source link, claim label and exact value.
6. If an unsupported question, accession or reader is supplied, return NOT_ESTABLISHED.
7. If the current packet cannot answer the question, present an unanswered research item and no invented citations.

## The six questions

| Topic | Visitor question | Documented anchor | Meaningful disagreement |
|---|---|---|---|
| cover | Who designed the catalogue cover? | Léger and 1927 | Futurist: new graphic vocabulary; Worker: unnamed print labor; Archivist: confirmed cover credit only |
| network | Who initiated the exposition? | Jane Heap, international effort | Networked futures versus the work of producing the event |
| machines | How did the exposition relate machinery to modern design? | Museum's curatorial summary of mechanical beauty and streamlined forms | Promises of technology versus manufacturing and maintenance |
| essays | Who wrote about machines and art? | Prampolini and Archipenko | Name the contributors but do not invent what their essays argued |
| labor | Who made the machines? | No individual labor record in current packet | Ask better questions, distinguish missing evidence from historical absence |
| evidence | What do we know? | Identity, cover designer, initiator, 1927 | Curatorial interpretation versus primary page evidence |

## Test the demonstration
With checkout on branch feat/object-lens-source-first-p0-20261116:

npm ci
node --test test/object-lens-core.test.mjs test/machine-age-research.test.mjs
npm run demo:society

Open in browser (loopback local demonstration):
http://127.0.0.1:8787/demo/object-lens/?accession=XM1999.108.8

1. Observe URL has prefilled accession but does NOT confirm it.
2. Confirm the public packet manually, view three reader scripts.
3. Under "Ask the research" select six questions; verify fact rows source to museum checklist, never directly to original 1927 page.
4. Choose the same question as Worker, Futurist and Archivist. Answer and evidence limitations differ.
5. For "Where are the workers?" as Archivist, see UNANSWERED_RESEARCH_QUESTION, zero cited facts, and a precise unanswered research requirement.
6. Try local voice; spoken text must equal displayed selected answer. Transcript remains when no voice is installed.
7. Follow Atlas handoff; isolated node with no fabricated connections is acceptable.
8. Camera preview is optional, automatic image matching and live generative answers are still not implemented.

The mobile Chromium CI executes these steps where feasible. Real iPhone Safari, Android, voice, permissions and collection-object photography still require on-device verification.

## Future development after source review
1. Ask Hannah/curatorial staff to confirm actual catalogue/foreword/essay pages, bibliographic data and image rights.
2. Add approved page-level claim pointers with source edition and reviewer, rather than rewriting the museum summary as a historical quotation.
3. Add an archival dialogue about contradictory primary interpretations only when the text has been inspected.
4. Expand to six to eight fully sourced objects, then provide QR recognition candidates; do not call manual accession entry "recognition."
5. Only then evaluate bounded generative conversation with claim validation and optional speech provider.

## Release boundaries
Draft PR #28 is **not merged**. The existing repository issue #25 asks the museum to determine public redistribution scope for staff-matrix and saved Lakehouse material already present on main. This feature does not copy, expand or republish those datasets. Do not approve public deployment or publish images based merely on this internal demonstration.

GitHub:
- PR #28: https://github.com/moisestech/wolfsonian-public-api-research/pull/28
- Source rights issue #25: https://github.com/moisestech/wolfsonian-public-api-research/issues/25
- Broader roadmap issue #29: https://github.com/moisestech/wolfsonian-public-api-research/issues/29
