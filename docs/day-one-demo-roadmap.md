# Day-One Demo Roadmap — October 26, 2026

## Goal

Arrive at The Wolfsonian–FIU with a working **artistic infrastructure** for *The Archive Dreams in Public* that can be demonstrated to staff on day one, while keeping institutional data, authorization, curation, rights, and internal system semantics as explicit research inputs to be resolved during the fellowship.

The day-one build should prove the experience before institutional integration:

> archival records become places; interpretive agents become inhabitants; encounters become conversations; claims can be traced back to evidence; unresolved contradictions become onsite research questions.

The system must work from mock fixtures and public packets before any internal Lakehouse/API access is required.

---

## North-star experience

The visitor should understand this sequence without explanation:

`WORLD → ENCOUNTER → CONVERSATION → CLAIM → EVIDENCE → RESIDENCY QUESTION`

A second persistent path lets the viewer move between two views of the same simulation:

- **World View** — spatial, game-like, agent movement, encounters, conversations.
- **Research View** — source packets, claims, contradictions, provenance, uncertainty, object-request questions.

The two views must share the same underlying simulation state. Research is the microscope; World is the organism.

---

## Contract boundary

### A. Repo / artwork contract — build before October 26

Owned fully by the project:

- normalized archival-record schema
- source adapters
- world state
- agents and roles
- agent movement / attention
- encounters
- conversations
- claim objects
- evidence links
- contradiction state
- uncertainty state
- provenance inspector
- Residency-question generation
- semantic zoom / camera behavior
- World ↔ Research navigation
- deterministic authored simulation baseline
- mock-data stress corpus
- public-record demo corpus
- replayable demo scenarios
- offline fallback

### B. Institutional research contract — resolve with Wolfsonian staff

Do **not** guess these in code:

- approved machine-readable access route
- Lakehouse field meanings
- source-system mappings
- authoritative identifiers
- public vs internal fields
- rights / publication rules
- asset-display permissions
- export / retention rules
- relationship semantics
- curatorial corrections
- library context
- physical-object observations
- what can enter the public repository after the fellowship

The institution supplies records, context, permissions, expertise, and corrections. The artist authors the agents, rules, world, visual grammar, simulation, and artistic framing.

---

## Data-source architecture

The engine should boot against a common `ArchiveRecord` contract using four source modes:

1. `MOCK` — invented fixtures for interaction and scale testing.
2. `PUBLIC` — manually verified public Wolfsonian packets.
3. `INSTITUTIONAL` — adapter stub before residency; approved Lakehouse/API/export route later.
4. `ONSITE` — adapter stub for physical/staff research annotations.

Suggested core contract:

```ts
interface ArchiveRecord {
  id: string;
  sourceLayer: "MOCK" | "PUBLIC" | "INSTITUTIONAL" | "ONSITE";
  access: "PUBLIC" | "PRIVATE_RESEARCH" | "PERMISSION_REQUIRED";
  identity: {
    accessionNumber?: string;
    bibId?: string;
    title: string;
    date?: string;
    creators?: string[];
    objectType?: string;
  };
  metadata: {
    materials?: string[];
    dimensions?: string;
    subjects?: string[];
    description?: string;
  };
  provenance: {
    sourceSystem: string;
    sourceRecordId?: string;
    sourceUrl?: string;
    retrievedAt: string;
  };
  rights?: {
    displayAllowed?: boolean;
    publicationAllowed?: boolean;
    notes?: string;
  };
  relationships: ArchiveRelationship[];
  notEstablished: string[];
}
```

Interpretive claims remain separate from source records.

---

# Timeline

## Sep 4–8 — Phase 0: lock the architecture

**Outcome:** the repo has a clean seam between data, simulation logic, and rendering.

Tasks:

- preserve `/demo/` as the stable Research Demo 001
- create `/world/` as the experimental living-simulation surface
- create `src/core/` contracts for records, claims, agents, encounters, and world state
- create source adapters:
  - `MockAdapter`
  - `PublicPacketAdapter`
  - `InstitutionalAdapter` stub
  - `OnsiteAdapter` stub
- document public/private data rules
- create a 30-record fixture corpus clearly marked `fixture: true`
- define visual semantics for source / interpretation / uncertainty / fabrication

**Gate:** existing demo still builds and tests; world can load mock/public records without knowing where they came from.

---

## Sep 9–15 — Phase 1: World 0.1 vertical slice

**Anchor:** Sparton Radio.

**Agents:** Archivist, Worker, Futurist, Propagandist.

Build one complete experiential chain:

1. World view with the radio as a stable place.
2. Four agents move toward it for different reasons.
3. Camera enters Encounter view.
4. A short deterministic conversation plays.
5. One claim can be selected.
6. Claim inspector distinguishes inference from source support.
7. Evidence view opens the public packet.
8. One unresolved contradiction becomes a Residency question.

Rendering target: PixiJS/WebGL for world + normal DOM for research inspectors.

**Gate:** a new viewer can correctly explain what the object is, who the agents are, who disagrees, which statement is interpretation, and why the museum is needed.

---

## Sep 16–23 — Phase 2: make interaction legible

Focus on design, not scope.

Implement:

- strong selected-node feedback
- connected-edge emphasis / unrelated-node fade
- hover vs selected states
- semantic zoom levels
- camera transitions
- compact world labels
- agent-state labels
- conversation bubbles
- system-event labels (`CLAIM CHALLENGED`, `CONTRADICTION FORMED`)
- source typography distinct from agent typography
- stable visual identity for each agent
- keyboard navigation and reduced motion

Agent identity should come from movement + language + typography + shape/color, not only avatars.

**Gate:** viewers can identify evidence vs interpretation before reading explanatory copy.

---

## Sep 24–28 — Phase 3: object-request alignment

Use the existing Research Demo and early World build to finish the September 28 preliminary materials list.

For each of the four anchors:

- Trylon and Perisphere
- Sparton 558-C
- Mappemonde
- *Machine Age Exposition* catalogue

Identify 2–4 satellite materials that test a specific contradiction or gap.

Target: roughly 12–16 interconnected requested materials, not an arbitrary large list.

Each requested item should have:

- identifier / title
- public source
- generating contradiction
- why physical/library access matters
- focused onsite questions

**Gate:** the request list can be explained as an output of the research method.

---

## Sep 29–Oct 6 — Phase 4: World 0.2

Scale from one record to the current 6-record public corpus.

Build:

- several archival districts / places
- six bounded agents
- persistent attention and movement
- multiple encounters
- persistent contradictions
- Research ↔ World switch that preserves selection/context
- world-state event log
- replayable deterministic scenario

The graph remains the mathematical substrate, but the viewer sees geography, paths, gathering, distance, and social activity.

**Gate:** the world no longer feels like a force-directed graph with animation layered on top.

---

## Oct 7–14 — Phase 5: integration seam + stress test

Do not seek internal Wolfsonian data yet. Prove the adapters.

Tasks:

- boot World from `--source=mock`
- boot World from `--source=public`
- run a 30-record fixture stress corpus
- test 6–10 moving agents
- test label density / collisions / camera behavior
- test at least 10 simultaneous encounters in fixture mode
- add institutional and onsite adapter fixtures without data
- add source-layer badges in Research View
- add access/rights states in data model
- ensure private/internal data cannot accidentally compile into public static output

**Gate:** replacing the source adapter does not require rewriting the world or claim engine.

---

## Oct 15–20 — Phase 6: day-one story and presentation

Prepare the exact 10–15 minute staff introduction already scheduled for October 26.

Demo narrative:

1. **Public memory** — what the project can establish from public records.
2. **World** — watch agents inhabit that partial memory.
3. **Encounter** — zoom into one dispute.
4. **Claim** — inspect what is interpretation vs evidence.
5. **Research gap** — show what the current record cannot establish.
6. **Residency** — show the question that must leave the simulation and enter the museum.
7. **Institutional seam** — show the adapter contract and explain how approved Wolfsonian data/context can revise the same world without changing the artwork architecture.

Prepare:

- live demo
- 2–3 minute screen recording fallback
- offline build
- one architecture diagram
- one public-vs-institutional-vs-onsite diagram
- one slide / view showing the four anchor objects and request logic

**Gate:** demo can be delivered without internet.

---

## Oct 21–25 — Phase 7: freeze and rehearse

No speculative feature work.

- bug fixes only
- test desktop + laptop presentation resolution
- verify offline mode
- verify no private material ships
- rehearse 10–15 minute intro
- rehearse 5-minute technical walkthrough for digital team
- prepare question list for Digital Assets / IT
- prepare question list for library team
- prepare a blank Institutional Adapter mapping sheet

**Gate:** main demo build is tagged / frozen and reproducible.

---

# Day-one definition of done

By Monday, October 26, the project should demonstrate all of the following:

- stable Research Demo 001 remains available
- new World View runs in browser using WebGL/PixiJS or equivalent
- 6 real public packets are supported
- 30-record mock stress corpus is supported
- at least 4 agents visibly move and gather with distinct behaviors
- at least one end-to-end encounter is polished
- conversation, claim, and evidence are visually distinct stages
- evidence and interpretation use different typography / visual systems
- one claim can be traced to exact public provenance
- one contradiction visibly persists in world state
- one unresolved contradiction produces an onsite research question
- World ↔ Research navigation preserves context
- mock/public adapters both work
- institutional/onsite adapters exist as documented stubs
- no internal Wolfsonian data is assumed or published
- live demo + offline fallback + screen-recorded fallback exist

---

# Day-one demo script

### 0:00–2:00 — premise

“The public archive is the partial memory of an artificial society.”

Explain that the current build deliberately begins from public records and marks what it cannot establish.

### 2:00–5:00 — World View

Show agents moving through archival geography. Follow them toward the Sparton Radio.

### 5:00–8:00 — Encounter / Conversation

Show Futurist, Worker, Propagandist, and Archivist reading the same object differently.

### 8:00–10:00 — Claim / Evidence

Select one statement and descend into its provenance. Demonstrate the distinction between source-supported information and interpretation.

### 10:00–12:00 — Residency output

Show how the unresolved dispute produces a concrete physical/library research question.

### 12:00–15:00 — institutional collaboration

Show the source-adapter diagram:

`MOCK / PUBLIC / INSTITUTIONAL / ONSITE → normalized record contract → same simulation world`

Ask the digital team to help determine how approved Lakehouse/API/export data should map into that contract, what must remain private, and what the project may retain/publish.

---

# Digital-team questions for October 26

The technical goal is not broad unrestricted access. Prefer a bounded, approved research corpus.

Questions:

- How does a Lakehouse record map to the public catalog/accession identifier?
- Which source systems feed it?
- Which transformations happen before data reaches public interfaces?
- Does field-level provenance survive those transformations?
- How are null, missing, unpublished, and rights-restricted states distinguished?
- How are digital assets linked to object/library records?
- Are relationships/entities already normalized?
- Is there an approved Parquet/CSV/DuckDB/API export route for a bounded fellowship corpus?
- What data may be retained after the residency?
- What data may appear in a public repository/artwork?

---

# Library / collections questions

Use staff expertise to discover what the graph cannot.

- Which related catalogues, manuals, trade publications, ephemera, advertisements, or correspondence sit around the anchor objects?
- Which materials complicate the public description?
- Which objects are worth seeing because scale, back/underside, wear, maker marks, annotations, binding, paper, or construction materially change interpretation?
- Where does staff knowledge connect records that public metadata does not?

---

# Non-goals before residency

- full generative society
- thousands of agents
- MiroFish fork
- autonomous historical truth claims
- bypassing access controls
- ingesting the Lakehouse without explicit approval
- full 3D game world
- museum collection photography without clarified rights
- optimizing prediction accuracy

The pre-residency objective is **artistic and interaction infrastructure**, not institutional completeness.

---

## North-star division

> **Before the fellowship: build the language.**  
> **During the fellowship: let the institution change what that language is able to say.**
