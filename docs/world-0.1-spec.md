# World 0.1 — Sparton Vertical Slice

## Purpose

Prove the interaction grammar for the day-one October 26 demo before scaling the corpus or introducing institutional data.

This build should make one archival encounter understandable and beautiful:

`WORLD → ENCOUNTER → CONVERSATION → CLAIM → EVIDENCE → RESIDENCY QUESTION`

It uses the existing public Sparton Radio packet and deterministic authored claims. No LLM calls and no institutional/Lakehouse data are required.

---

## Scene

### Anchor record

Sparton Radio, model 558-C (public packet already in the repo).

### Agents

- Archivist
- Worker
- Futurist
- Propagandist

### Core dispute

A formal reading of streamlining can support an interpretation of technological optimism / desirability, while Worker and Archivist challenge what the public packet can actually establish about labor, use, reception, or social effect.

The build must preserve the distinction between museum/public facts and authored interpretation.

---

## Stage 1 — World

### Viewer sees

- one stable archival place representing the radio
- four agents moving independently
- minimal labels only
- no paragraph text

### Required interactions

- hover: subtle highlight
- select: place enlarges, connected agents/paths emphasize, unrelated content fades
- camera: smooth transition toward selected place

### Text allowed

- `SPARTON RADIO · 1937`
- agent names
- short agent states such as `investigating form`

---

## Stage 2 — Encounter

Agents gather around the radio.

### Viewer should understand

- multiple agents are attending to the same record
- each agent approaches from a different interpretive role
- the record remains the stable center

### Agent-state examples

- Futurist — `reading technological promise`
- Worker — `looking for labor / production`
- Propagandist — `reading persuasion / desirability`
- Archivist — `checking source support`

These are authored state labels, not source metadata.

---

## Stage 3 — Conversation

Only now does sentence-level language appear.

Suggested deterministic exchange:

**Futurist**  
“The streamlined form can be read as making technological modernity feel fast and effortless.”

**Propagandist**  
“Design can make a new technology desirable before a user understands the system behind it.”

**Worker**  
“That reading does not establish whose work produced, repaired, or maintained the technology.”

**Archivist**  
“The public packet establishes object identity, designer/date/material information, but these broader social claims remain interpretations.”

Do not present these lines as historical quotations.

### Interaction

Selecting a sentence opens its Claim view.

---

## Stage 4 — Claim

World motion dims/pauses and structured research UI takes over.

Required fields:

- claim
- agent
- claimType
- source grounding
- what public packet establishes
- what is inference
- agrees with
- contradicts
- uncertainty
- what would change the claim

The selected statement should remain linked back to its originating agent and encounter.

---

## Stage 5 — Evidence

Evidence mode should look visibly different from agent dialogue.

Required:

- public packet identity
- accession / date / creator / materials where supported
- public source URLs
- retrieval date
- `not established in this public packet` fields

The viewer should feel a transition from interpretation to source material.

---

## Stage 6 — Residency Question

One unresolved contradiction becomes a research output.

Example framing:

> The current public packet cannot resolve how the object’s material construction, use history, repair traces, labels, or related documentary context should alter these interpretations.

Possible onsite questions:

- What maker marks, labels, wear, repairs, or construction details are visible only in person?
- What related advertisements, manuals, catalogues, trade literature, or institutional files contextualize how the radio was presented and understood?

The system must clearly distinguish these as research questions, not claims about what the museum possesses.

---

# Visual language

## Source / public record

- stable
- rectilinear / solid
- archival/serif typography
- neutral palette
- no idle motion

## Agent / interpretation

- agent-specific identity
- more dynamic typography/shape/motion
- curved/dynamic paths

## Uncertainty

- dashed / incomplete / translucent treatment
- explicit label

## Fabrication

Not required for the first Sparton conversation, but existing system semantics remain available. If used later, it must stay explicitly marked `FABRICATION_TEST`.

---

# Technical architecture

Recommended boundary:

- **PixiJS/WebGL**: world, camera, agents, paths, gathering, selection feedback
- **DOM/CSS**: claim, evidence, provenance, research controls
- **Existing repo data**: source packets and deterministic claims
- **No LLM**: authored baseline only

Renderer should receive state rather than own research logic.

Suggested state machine:

```ts
type ExperienceStage =
  | "WORLD"
  | "ENCOUNTER"
  | "CONVERSATION"
  | "CLAIM"
  | "EVIDENCE"
  | "RESIDENCY";
```

Suggested agent state:

```ts
interface AgentWorldState {
  id: string;
  position: { x: number; y: number };
  destination?: { x: number; y: number };
  attentionTarget?: string;
  state: "wandering" | "approaching" | "observing" | "speaking" | "challenging" | "leaving";
  activeClaimId?: string;
}
```

---

# Acceptance test

Give the prototype to someone without explaining the system first.

After 60–90 seconds they should be able to answer:

1. What is the archival object/place?
2. What are the moving entities?
3. Why did they gather?
4. Which two readings conflict?
5. Which statement is interpretation rather than source fact?
6. Where can they inspect the underlying evidence?
7. What question remains unresolved?
8. Why does that unresolved question justify onsite research?

If several answers are unclear, improve interaction grammar before adding more records or agents.

---

# Explicit non-goals

- 30 visible records
- live Wolfsonian API
- Lakehouse integration
- LLM dialogue
- crowd simulation at scale
- audio voices
- 3D
- collection photography
- autonomous history generation

World 0.1 exists to prove **legibility and interaction**, not scale.
