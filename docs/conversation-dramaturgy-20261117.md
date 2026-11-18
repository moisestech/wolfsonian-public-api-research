# Archive Dreams in Public · Conversational dramaturgy and interaction contract
Working artist/engineering note · November 17, 2026

## Premise
These are **fictional interpretations made from objects and source records**, not archived voices, oral histories, evidence that objects met, or a conversational AI that actually knows the museum. The collection is not a prop for a generic chatbot: each utterance must illuminate *a particular object, its representation, the historical future being promised, or a meaningful absence in the record*.

The museum's stated research/educational emphasis on critically examining the persuasive power of art and design, cultural modernity, and connections between past/present/future provides a design compass; it does **not** supply institutional endorsement of an independent artwork.

## The dialogue problem
The old common structure was: object A announces its title, object B announces a shared tag, Archivist announces a caveat. All three sentences could be rearranged without anyone reacting. A more believable scene must contain **uptake**: B hears A, challenges a specific premise, and A modifies its own thought. The record-checking role interrupts only where the dialogue is about to cross a factual boundary.

For the Nov 19 rehearsable prototype, the most visible four staff-tagged pairs are rewritten as **5 beats**:
1. **A concrete disturbance:** the object's actual catalog title, motif or documented visual fact creates a question.
2. **Resistance:** another object hears that claim and pushes back with a different stake.
3. **Repair:** the first object concedes, qualifies, or changes its mind; avoid automatic agreement.
4. **Evidence boundary:** a *fictional Archivist* says exactly what a source-backed match licenses, and what it does not.
5. **Afterthought:** the second object leaves a human-size question that invites further inspection, not a tidy verdict.

Five is a first rehearsal shape, **not a law**. In future authored passages, 2–9 turns may work better. Move source notes into inspectable record panels where possible rather than repeatedly saying 'my title is' or 'we are only fictional' within each turn. The fiction label must remain visible in the overall interface.

## Voices: not arbitrary character costumes
| Part | Conversational desire | Evidence discipline |
| --- | --- | --- |
| Object A | Wants the viewer to look again at its title/form | Never remembers a real owner or maker unless directly sourced |
| Object B | Disagrees because a different design purpose or social cost is at stake | Never retroactively creates acquaintance with A |
| Visitor / reader | Can interrupt, doubt and choose where to go | A question is not a research conclusion |
| Archivist (fictional role) | Challenges unsourced history and identifies a real needed source | Does not speak as an actual Wolfsonian staff member |
| Reading lens | Selects a *questioning frame* (work, power, domestic life, etc.) | Not the name of the first speaker |

The code now displays source object A as source object A, rather than mislabeled as the chosen reader archetype. Keep the reader lens visible outside the speech bubble.

## Source / trust contract
- **OBSERVED:** visually confirmed against an authorized inspected object or photograph; not merely inferred from its title.
- **CATALOG:** exact accession/field, with pointer and status from a uniquely matched authorized source.
- **CONTEXT:** external historic documentation with its own provenance and publication rights.
- **INTERPRETATION:** authored comparison, labeled speculative.
- **SIMULATION:** speaker/voice exists only in the artwork, never testimony.
- **UNRESOLVED:** no authorized evidence currently confirms this inference.

A shared thematic/motif tag can open a conversation; it cannot prove same-maker, same-room, shared experience, ownership, workshop, causality or shared physical box. Lakehouse Date may enter a fallback scene **only** after the existing exact unique primary accession match. When not verified, omit the fact rather than fill it in.

## Editorial standards for the next dozen scenes
- Make the particular **object and title indispensable**: replace it with another object; if the exchange still works, the dialogue is too generic.
- Distinguish each speaking attitude: skeptical, defensive, practical, amused, curious, reticent. Not just alternating male/female pitches.
- Include at least one actual counterargument or reconsideration; if the object doesn't listen, it's a monologue.
- Use one concrete image, task, material, or historical text per scene *only if documented*. Avoid 'progress', 'system', 'future', 'algorithms' in every sentence.
- No invented inscriptions, makers, worker experiences, archival box associations, dates, institutional approval or historical dialogue.
- End with a question that can lead the viewer to an object, a record, another object, or a request for museum research.
- Allow surprising silence or a deliberately unresolved disagreement. Do not force moral consensus.
- Build structured source review into new authored content before publishing.

## Mobile and desktop play/stop contract
- **One button on mobile**: press Play → accessible state `aria-pressed=true`, button displays Stop; press the same button → cancel speech, abort external voice requests and reset visual speaking state → Play.
- Desktop play/stop controls remain available, but state is synchronized.
- All three primary overlays close with **×**; their accessible labels announce what is being closed, Escape keeps working, and a 48px target accommodates touch. Navigating Back or Leave is a different action from dismissing a modal.
- Check at 390px viewport and landscape: a phone's initial timeline is not a map, and copy must describe the experience that is actually on screen.

## Rehearsal and test
1. Cold reader, no introduction: what do two linked objects share? Why are they *imagined* to be speaking? How do they inspect evidence?
2. Listen to a five-turn scene. Pause at turn 3: does B's objection actually change A's answer? If not, rewrite.
3. Ask whether a date, worker, or storage claim was presented without an identifiable source; any false claim is a release blocker.
4. Test mobile play → stop → play, native local voice unavailable, external provider not authorized, Escape/× close, and 390px phone.
5. Keep separate measurements: *real catalog field verifications*, *artist-authored scene revisions*, and *visitor inquiry paths*. They must not quietly count as the same thing.

## Scope of this PR
Four high-visibility exact-source-gated scenes have bespoke back-and-forth. The generic fallback is improved but remains a deterministic five-turn template; it is intentionally **not** described as fully natural dialogue. ElevenLabs is only an optional voice renderer after permission, not a generative conversation engine. A subsequent release should review all other scenes with curatorial advisors, add source-linked evidence cards, and only then consider constrained live branching.
