# Archive Dreams — six new public-record candidates & the difference we can make

**Research state:** source-verified at exhibition-checklist level; **NOT** yet matched to the current 76-record Lakehouse capture, photographed for redistribution, approved for publication, added to the current Atlas graph, or commissioned as live fictional speech.

**Source:** [The Wolfsonian–FIU, *World's Fairs: Visions of Tomorrow* exhibition checklist](https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf), 2025.  
**Context:** [*World's Fairs: Visions of Tomorrow*](https://wolfsonian.org/whats-on/exhibitions+installations/2025/05/worlds-fairs-visions-of-tomorrow.html) and [Marco Brambilla's *After Utopia*](https://wolfsonian.org/whats-on/exhibitions+installations/2025/12/marco-brambilla-after-utopia.html).

## Why these records and not another panoramic world's fair?

The 2025–26 museum program already reanimated architectural icons and posed questions about technological optimism, human agency, and future-making. A stronger new contribution here is **a visitor-controlled experiment in inference**: an algorithm suggests relationships; historical records constrain them; the objects disagree; the visitor can request evidence, reject a weak connection, or change the question.

The museum itself staged a powerful precedent in 1939: Futurama visitors passed through a planned view of the future **with synchronized narration**. Our strongest formal reversal is **not a more impressive futuristic environment, but an interruptible narration** in which the visitor can ask whose future is being explained and why. This is an art/interpretation proposal, not a documented historical conversation between two objects.

The museum's exhibition includes a children's audio tour as well. **Multiple voices alone are not novel**; the distinctive contribution is that the voices' **claims, source limits and visitor choices** are made inspectable.

## Curatorial queue, in priority order

| Priority | Accession | Published object | Interpretive role |
|---|---|---|---|
| P0 | **83.2.19** | *Futurama* book spread, 1939 | Controlled narration: the automated future speaks |
| P0 | **XC2024.03.1.1** | *Harlem Invites You to Visit the New York World's Fair* leaflet, 1939 | The audience and its itinerary: who is addressed by the future? |
| P0 | **83.6.2** | *The Threatening Shadow* maquette, c. 1938 (unexecuted/rejected proposal) | The warning that an optimistic exhibition refused |
| P1 | **84.6.14** | *La Gloire du fer* sculpture, c. 1889 | The labor required to make a monumental future |
| P1 | **TD1989.19.9** | *Direct Route to New York World's Fair – Pennsylvania Railroad* poster, 1939 | Transport as the condition of participation |
| P1 | **XB1991.830** | *Let's Go to the Fair and Futurama* pamphlet, c. 1964 | A repeat of Futurama; technological futurity as a recurring commercial story |

The source checklist lists **XC2017.01.2.311** in addition to **XB1991.830** for illustrated 1964–65 Futurama pamphlets. Confirm item identity/edition in a record before choosing imagery or a reading. The exact published 1939 Futurama **spread 83.2.19** is not the already-prepared 1940 Futurama **booklet XB1992.1640**.

### Avoid duplicating the existing seeds

Already represented in the independent *public-record corpus* (but not necessarily in the current 76-record conversational graph):
- **86.17.1**, Trylon and Perisphere (WOLF-001)
- **86.19.57**, Your World of Tomorrow (WOLF-006)
- **XB1992.1640**, Futurama booklet, 1940 (WOLF-007)
- **2012.6.1**, RCA Victor TRK 12 (WOLF-008)
- **XM1999.108.8**, Machine Age Exposition catalogue (WOLF-003)

**85.4.64.34**, *On Munitions: Skilled Work*, is already present in the 300-staff-tag working collection and the 16 curated edge scripts. It should be used as a **bridge out of the world's fairs chronology**, not mistaken for a published world's fair object.

## Three proposed research pairings, and their precise limitations

### A. Futurama × Harlem Invites You — **the narrated future meets the invited public**
What the checklist establishes: both are 1939 New York World's Fair documents; Futurama used synchronized narration and moving spectator seats; a Harlem-based business advertised visits aimed at an African American audience.  
What it **does not** establish: any Harlem Tours visitor used that specific ride, that General Motors addressed that visitor or responded to the leaflet, or what fairgoers actually believed.

**Suggested critical line, entirely fictional:**  
Futurama: “I provided the view and the voice. Did everyone who entered see themselves in the city I promised?”  
Harlem leaflet: “I provided a route to the fair. Your story begins after arrival. Mine begins with the question of who can enter.”  
Archivist: “These are independently documented objects associated with the 1939 fair; there is no proven direct encounter between them.”

### B. The Threatening Shadow × Trylon and Perisphere — **the warning that was not built**
What the checklist establishes: Trylon and Perisphere stood for the optimistic fair; the sculptor Alfonso Iannelli's proposed anti-authoritarian maquette was never built and the proposal was rejected by organizers.  
What it **does not** establish: private motivations of every decision-maker or the full relationship between this specific maquette and the architecture team.

### C. The Glory of Iron × On Munitions: Skilled Work — **what gets praised when labor creates progress**
What the checklist establishes: the first object celebrates Eiffel Tower builders; the 1917 print is an independently documented item in the current project.  
What it **does not** establish: influence, a shared maker, or any direct historical relation. This is **explicitly a researcher's curatorial comparison across separate historical contexts**, not a Lakehouse metadata-supported edge.

## Make the website and research richer without adding spectacle

- **About:** introduce the visitor's agency, acknowledge prior institutional work and distinguish “source material” from interpretation. Be transparent that *After Utopia* already asked meaningful questions; Archive Dreams changes the **visitor's role** and **evidentiary mechanism**, not just the imagery.
- **Research paths (About):** show 3 proposed pairings as preview questions only. Never decorate a future scene with a verified checkmark if the link is merely suggested.
- **Record inspector (future milestone):** add a provenance-oriented label for each record: **Public exhibition checklist / independent research packet / current bounded Lakehouse match / curator-approved asset**. These are different states.
- **Conversation guide (future milestone):** differentiate **metadata-supported connection** from **researcher's curated juxtaposition**. Do not introduce P0/P1 records into `societyView()` as though they share a tag. A curated edge requires its own kind, reviewed source refs, and interpretive boundaries.
- **Visitor feedback (future milestone):** offer **“This link is useful / this link is doubtful / investigate another source”** as non-personal session state, without claiming a machine can establish what the archive does not record.
- **Exit prompt:** ask “Which relationship surprised you, and what would you need to believe it?” This is more substantive than “What did you think of AI?”

## Actual implementation pathway and constraints

1. **Today:** keep the P0/P1 records in `data/research/worlds-fairs-critical-records-20261117.json` with source and review status. The status is `research_only_not_runtime`. The About page may refer to them as proposed paths, but not as available live conversations.
2. **Record review:** consult Luna/curator and collections team, identify exact item edition/rights, request copies/photographs, and verify what the bounded Lakehouse endpoint actually exposes. An exhibition checklist is not itself a checked live API match.
3. **Register authorial relationships separately:** proposed schema: `{sourceAccession,targetAccession,relationKind:'curatorial_juxtaposition',sourceIds,reviewStatus:'approved',limits:[...]}`. **Do not backfill a fabricated metadata tag** into `src/matrix-objects.mjs`. Preserve the distinction from actual `family/value` metadata reasons.
4. **Authorize the script:** once approved, write the original critical and poetic object lines and a **single, identical evidence-bound Archivist statement** shared by both tones. Do not impersonate historical figures or museum personnel. Export hash-indexed audio cues only after line approval.
5. **Promote to an internal app only when ready:** verify repository/public asset rights issue #25, protected access issue #27, mobile display and source inspector. Never treat successful CI as a curator's approval.

## Key review prompts for Luna, Silvia, Frank and Mark

- Does the institution want to revisit world's fair iconography, or open an inquiry into who **authored, received, refused, and funded** visions of modernity?
- Are the 1939 Futurama and Harlem Tours records available in a rights-cleared form for an *internal* demonstration?
- Can we research the decision to reject *The Threatening Shadow*, and what is documented versus inferred about that decision?
- Is a **curator-selected juxtaposition** (without machine-derived shared categories) acceptable as a visibly different type of connection?
- What evidence would convince you that the visitor learned a new *question*, not simply heard AI-generated dialogue?

**Source-limited release principle:** “The archive may start a conversation it cannot finish. That uncertainty is the artwork's invitation, not something to conceal.”
