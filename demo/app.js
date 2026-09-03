import { createGraphBackdrop } from './three-backdrop.mjs';

const VIEWS = [
  { id: 'archive', label: 'Archive' },
  { id: 'interpretation', label: 'Interpretation' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'contradictions', label: 'Contradictions' },
  { id: 'unknown', label: 'Unknown' },
  { id: 'residency', label: 'Residency' }
];

const AGENT_POSITIONS = {
  archivist: { x: 140, y: 114 },
  futurist: { x: 500, y: 62 },
  worker: { x: 860, y: 114 },
  mourner: { x: 140, y: 426 },
  propagandist: { x: 500, y: 458 },
  counterfeit: { x: 860, y: 426 }
};

const CENTER = { x: 500, y: 250 };
const AGENT_PORTRAITS = {
  archivist: 'https://res.cloudinary.com/dck5rzi4h/image/upload/v1782901407/grants/wolfsonian/agents/archivist_enoxwd.png',
  worker: 'https://res.cloudinary.com/dck5rzi4h/image/upload/v1782901403/grants/wolfsonian/agents/worker_ofjxn0.png',
  futurist: 'https://res.cloudinary.com/dck5rzi4h/image/upload/v1782901408/grants/wolfsonian/agents/futurist_layjim.png',
  mourner: 'https://res.cloudinary.com/dck5rzi4h/image/upload/v1782901407/grants/wolfsonian/agents/mourner_egkmra.png',
  propagandist: 'https://res.cloudinary.com/dck5rzi4h/image/upload/v1782901419/grants/wolfsonian/agents/propagandist_uuwflg.png',
  counterfeit: 'https://res.cloudinary.com/dck5rzi4h/image/upload/v1782901404/grants/wolfsonian/agents/counterfeit_oz5ee8.png'
};

const state = {
  trial: null,
  manifest: null,
  graph: null,
  rounds: [],
  candidates: null,
  packets: new Map(),
  view: 'archive',
  roundIndex: 0,
  selectedClaimId: null,
  selectedSeedId: null,
  objectId: null,
  agentId: null,
  onsiteOpen: false
};

const els = {
  landing: document.getElementById('landing'),
  landingTagline: document.getElementById('landing-tagline'),
  landingDisclaimer: document.getElementById('landing-disclaimer'),
  landingStats: document.getElementById('landing-stats'),
  landingNote: document.getElementById('landing-note'),
  enterSim: document.getElementById('enter-sim'),
  simShell: document.getElementById('sim-shell'),
  shellDisclaimer: document.getElementById('shell-disclaimer'),
  viewTabs: document.getElementById('view-tabs'),
  graphBackdrop: document.getElementById('graph-backdrop'),
  graphCanvas: document.getElementById('graph-canvas'),
  graphCaption: document.getElementById('graph-caption'),
  roundKicker: document.getElementById('round-kicker'),
  roundTitle: document.getElementById('round-title'),
  roundSwitch: document.getElementById('round-switch'),
  claimList: document.getElementById('claim-list'),
  interrogation: document.getElementById('interrogation'),
  interrogationBody: document.getElementById('interrogation-body'),
  openDeepRead: document.getElementById('open-deep-read'),
  deepRead: document.getElementById('deep-read'),
  closeDeepRead: document.getElementById('close-deep-read'),
  objectTabs: document.getElementById('object-tabs'),
  objectLabel: document.getElementById('object-label'),
  objectFigure: document.getElementById('object-figure'),
  objectTitle: document.getElementById('object-title'),
  objectMeta: document.getElementById('object-meta'),
  archivalActor: document.getElementById('archival-actor'),
  objectCore: document.getElementById('object-core'),
  agentNodes: document.getElementById('agent-nodes'),
  relationLayer: document.getElementById('relation-layer'),
  panelKicker: document.getElementById('panel-kicker'),
  panelHeading: document.getElementById('panel-heading'),
  panelEmpty: document.getElementById('panel-empty'),
  panelBody: document.getElementById('panel-body'),
  panel: document.getElementById('agent-panel'),
  ledgerSource: document.getElementById('ledger-source'),
  ledgerInterpretation: document.getElementById('ledger-interpretation'),
  ledgerUncertainty: document.getElementById('ledger-uncertainty'),
  ledgerOnsite: document.getElementById('ledger-onsite'),
  sourceLink: document.getElementById('source-link'),
  onsiteCta: document.getElementById('onsite-cta'),
  onsiteList: document.getElementById('onsite-list')
};

let graphBackdropController = {
  updateSelection() {},
  destroy() {}
};

function voiceForAgent(agentId) {
  const match = state.trial.agents.find((agent) => agent.id === agentId);
  return match?.voice || '';
}

function portraitForAgent(agentId) {
  return AGENT_PORTRAITS[agentId] || '';
}

function labelForAgent(agentId) {
  const match = state.trial.agents.find((agent) => agent.id === agentId);
  return match ? match.label : agentId;
}

function currentPacket() {
  return state.packets.get(state.objectId);
}

function packetBySeed(seedId) {
  return [...state.packets.values()].find((packet) => packet.seedId === seedId);
}

function assetUrl(relativeFromObjectJson) {
  return relativeFromObjectJson.replace(/^\.\.\//, './');
}

function allClaims() {
  return state.rounds.flatMap((round) =>
    round.claims.map((claim) => ({ ...claim, roundId: round.id, roundTitle: round.title }))
  );
}

function visibleClaims() {
  const claims = allClaims();
  if (state.view === 'simulation') {
    return state.rounds[state.roundIndex].claims.map((claim) => ({
      ...claim,
      roundId: state.rounds[state.roundIndex].id,
      roundTitle: state.rounds[state.roundIndex].title
    }));
  }
  if (state.view === 'contradictions') {
    return claims.filter((claim) => claim.contradicts?.length);
  }
  if (state.view === 'unknown') {
    return claims.filter((claim) => claim.claimType === 'INFERENCE' || claim.claimType === 'UNCERTAIN' || claim.publicRecordEstablishes === false);
  }
  if (state.view === 'residency') {
    return claims.filter((claim) => claim.residencyQuestion);
  }
  return [];
}

async function loadAll() {
  const [trial, manifest, graph, candidates] = await Promise.all([
    fetch('./data/trial-001.json').then((r) => r.json()),
    fetch('./data/simulations/sim-001/manifest.json').then((r) => r.json()),
    fetch('./data/graph.json').then((r) => r.json()),
    fetch('./data/object-request-candidates/sim-001.json').then((r) => r.json())
  ]);

  const rounds = await Promise.all(
    manifest.rounds.map((id) => fetch(`./data/simulations/sim-001/rounds/${id}.json`).then((r) => r.json()))
  );

  const packets = await Promise.all(
    trial.objects.map(async (id) => {
      const packet = await fetch(`./data/objects/${id}.json`).then((r) => r.json());
      return [id, packet];
    })
  );

  state.trial = trial;
  state.manifest = manifest;
  state.graph = graph;
  state.candidates = candidates;
  state.rounds = rounds;
  state.packets = new Map(packets);
  state.objectId = trial.objects[0];
}

function renderLanding() {
  const c = state.manifest.counts;
  els.landingTagline.textContent = state.manifest.tagline || state.trial.tagline;
  els.landingDisclaimer.textContent = state.trial.disclaimer;
  els.shellDisclaimer.textContent = state.trial.disclaimer;
  els.landingStats.textContent = `${c.records} source records · ${c.entities} extracted entities · ${c.relationships} relationships · 6 interpretive agents (+ Museum in rounds) · ${c.unresolvedContradictions} unresolved contradictions`;
  els.landingNote.textContent = `${state.trial.framingNote || ''} ${state.trial.dataNote} ${state.trial.representationNote} Capacity ${state.manifest.capacity.shippedRecords}/${state.manifest.capacity.maxRecords}.`.trim();
}

function renderViewTabs() {
  els.viewTabs.replaceChildren();
  for (const view of VIEWS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'object-tab';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(view.id === state.view));
    button.textContent = view.label;
    button.addEventListener('click', () => {
      state.view = view.id;
      state.selectedClaimId = null;
      renderViewTabs();
      renderSim();
    });
    els.viewTabs.append(button);
  }
}

function layoutGraph() {
  const records = state.graph.nodes.filter((node) => node.kind === 'record');
  const concepts = state.graph.nodes.filter((node) => node.kind !== 'record');
  const positions = new Map();
  const cx = 500;
  const cy = 280;
  records.forEach((node, index) => {
    const angle = (Math.PI * 2 * index) / records.length - Math.PI / 2;
    positions.set(node.id, {
      x: cx + Math.cos(angle) * 210,
      y: cy + Math.sin(angle) * 160
    });
  });
  concepts.forEach((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(concepts.length, 1);
    const radius = 70 + (index % 5) * 18;
    positions.set(node.id, {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius * 0.75
    });
  });
  return positions;
}

function edgeVisible(edge) {
  if (state.view === 'archive') return edge.layer === 'source';
  if (state.view === 'interpretation') return edge.layer === 'interpreted';
  if (state.view === 'simulation' || state.view === 'contradictions' || state.view === 'unknown' || state.view === 'residency') {
    return true;
  }
  return true;
}

function drawGraph() {
  const svg = els.graphCanvas;
  svg.replaceChildren();
  const positions = layoutGraph();
  const claimSeeds = new Set(
    visibleClaims().flatMap((claim) => claim.grounding.map((g) => `record:${g.seedId}`))
  );

  const activeRecordId = state.selectedSeedId ? `record:${state.selectedSeedId}` : null;
  const relatedNodeIds = new Set([...(activeRecordId ? [activeRecordId] : [])]);
  if (activeRecordId) {
    for (const edge of state.graph.edges) {
      if (edge.source === activeRecordId || edge.target === activeRecordId) {
        relatedNodeIds.add(edge.source);
        relatedNodeIds.add(edge.target);
      }
    }
  }

  for (const edge of state.graph.edges) {
    if (!edgeVisible(edge)) continue;
    const from = positions.get(edge.source);
    const to = positions.get(edge.target);
    if (!from || !to) continue;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2 - 18;
    path.setAttribute('d', `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`);
    path.setAttribute('class', edge.layer === 'source' ? 'graph-edge graph-edge--source' : 'graph-edge graph-edge--interpreted');
    const focused = !activeRecordId || edge.source === activeRecordId || edge.target === activeRecordId;
    path.style.opacity = focused ? '1' : '0.14';
    path.setAttribute('stroke-width', focused ? '2.4' : '0.95');
    svg.append(path);
  }

  for (const node of state.graph.nodes) {
    const pos = positions.get(node.id);
    if (!pos) continue;
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${pos.x} ${pos.y})`);
    const isSelected = node.kind === 'record' && node.seedId === state.selectedSeedId;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', node.kind === 'record' ? (isSelected ? '22' : '18') : '6');
    circle.setAttribute(
      'class',
      [
        'graph-node',
        `graph-node--${node.kind}`,
        claimSeeds.has(node.id) ? 'is-active' : '',
        isSelected ? 'is-selected' : ''
      ]
        .filter(Boolean)
        .join(' ')
    );
    group.append(circle);

    const shouldDim = Boolean(activeRecordId) && !relatedNodeIds.has(node.id);
    group.style.opacity = shouldDim ? '0.22' : '1';

    if (node.kind === 'record') {
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${node.label} · ${node.accessionNumber || node.seedId}`;
      group.append(title);

      const idText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      idText.setAttribute('y', '4');
      idText.setAttribute('text-anchor', 'middle');
      idText.setAttribute('class', 'graph-label graph-label--id');
      idText.textContent = node.seedId.replace('WOLF-', '');
      group.append(idText);

      const accText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      accText.setAttribute('y', '34');
      accText.setAttribute('text-anchor', 'middle');
      accText.setAttribute('class', `graph-label graph-label--accession${isSelected ? ' is-selected' : ''}`);
      accText.textContent = node.accessionNumber || node.seedId;
      group.append(accText);

      if (isSelected) {
        const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameText.setAttribute('y', '48');
        nameText.setAttribute('text-anchor', 'middle');
        nameText.setAttribute('class', 'graph-label graph-label--title');
        const shortTitle = String(node.label || '')
          .replace(/^Model,\s*/i, '')
          .replace(/^Radio,\s*/i, '')
          .replace(/^Catalogue,\s*/i, '')
          .replace(/^Poster,\s*/i, '')
          .replace(/^Program,\s*/i, '')
          .replace(/^Vase with lid,\s*/i, '');
        nameText.textContent = shortTitle.length > 28 ? `${shortTitle.slice(0, 26)}…` : shortTitle;
        group.append(nameText);
      }

      group.setAttribute('tabindex', '0');
      group.setAttribute('role', 'button');
      group.setAttribute('aria-pressed', String(isSelected));
      group.setAttribute('aria-label', `Select record ${node.accessionNumber || node.seedId}: ${node.label}`);
      group.style.cursor = 'pointer';
      const select = () => {
        state.selectedSeedId = node.seedId;
        const packet = packetBySeed(node.seedId);
        if (packet) {
          state.objectId = packet.id;
          els.openDeepRead.hidden = false;
          els.openDeepRead.classList.add('is-emphasized');
          els.openDeepRead.textContent = `Open deep-read · ${node.accessionNumber || node.seedId}`;
        }
        renderSim();
      };
      group.addEventListener('click', select);
      group.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
    }
    svg.append(group);
  }

  const captions = {
    archive: 'Archive view — relationships established by source metadata only.',
    interpretation: 'Interpretation view — inferred entities, pressures, and cross-record links.',
    simulation: 'Simulation view — active round claims grounded in selected records.',
    contradictions: 'Contradictions — disagreement edges and opposing claims.',
    unknown: 'Unknown — inferences and claims the public record cannot yet establish.',
    residency: 'Residency — questions that require physical objects or institutional knowledge.'
  };
  const selectedPacket = packetBySeed(state.selectedSeedId);
  const selectionNote = selectedPacket
    ? ` Selected: ${selectedPacket.source.accessionNumber} — ${selectedPacket.source.title}.`
    : ' Click a numbered record node to select it.';
  els.graphCaption.textContent = `${captions[state.view]}${selectionNote}`;
  graphBackdropController.updateSelection(state.selectedSeedId);
}

function renderRoundSwitch() {
  const show = state.view === 'simulation';
  els.roundSwitch.hidden = !show;
  els.roundSwitch.replaceChildren();
  if (!show) return;
  state.rounds.forEach((round, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'object-tab';
    button.setAttribute('aria-selected', String(index === state.roundIndex));
    button.textContent = `R${index + 1}`;
    button.addEventListener('click', () => {
      state.roundIndex = index;
      state.selectedClaimId = null;
      renderSim();
    });
    els.roundSwitch.append(button);
  });
}

function renderClaims() {
  const claims = visibleClaims();
  els.claimList.replaceChildren();
  els.roundKicker.textContent = state.view;
  if (state.view === 'simulation') {
    els.roundTitle.textContent = state.rounds[state.roundIndex].title;
  } else if (state.view === 'archive' || state.view === 'interpretation') {
    els.roundTitle.textContent = 'Select a record node, then open deep-read';
  } else if (state.view === 'residency') {
    els.roundTitle.textContent = `${state.candidates?.candidates?.length || 0} object-request candidates · ${claims.length} onsite questions`;
  } else {
    els.roundTitle.textContent = `${claims.length} claims`;
  }

  if (state.view === 'residency' && state.candidates?.candidates?.length) {
    for (const item of state.candidates.candidates) {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'claim-item claim-item--request';
      button.innerHTML = `<span class="claim-agent">${item.accessionNumber}</span><span class="claim-text"><strong>${item.title}</strong><br>${item.whyRequest}</span>`;
      button.addEventListener('click', () => {
        state.selectedSeedId = item.seedId;
        const packet = packetBySeed(item.seedId);
        if (packet) {
          state.objectId = packet.id;
          els.openDeepRead.hidden = false;
        }
        renderRequestInterrogation(item);
        drawGraph();
      });
      li.append(button);
      els.claimList.append(li);
    }
    const divider = document.createElement('li');
    divider.className = 'claim-empty';
    divider.textContent = 'Onsite questions from simulation rounds:';
    els.claimList.append(divider);
  }

  if ((state.view === 'archive' || state.view === 'interpretation') && !claims.length) {
    const li = document.createElement('li');
    li.className = 'claim-empty';
    li.textContent = 'Graph shows source vs interpreted memory. Use Simulation / Contradictions / Unknown / Residency for claims, or open a record deep-read.';
    els.claimList.append(li);
    els.interrogation.hidden = true;
    return;
  }

  for (const claim of claims) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `claim-item kind-${claim.claimType}${state.selectedClaimId === claim.id ? ' is-selected' : ''}${
      claim.grounding?.some((g) => g.seedId === state.selectedSeedId) ? ' is-seed-related' : ''
    }`;
    const typeClass =
      claim.claimType === 'SOURCE_SUPPORTED'
        ? 'claim-type claim-type--source'
        : claim.claimType === 'FABRICATION_TEST'
          ? 'claim-type claim-type--fabricate'
          : 'claim-type claim-type--interpretive';
    const textTone =
      claim.claimType === 'SOURCE_SUPPORTED'
        ? 'source'
        : claim.claimType === 'FABRICATION_TEST'
          ? 'fabricate'
          : 'interpretive';
    button.innerHTML = `<span class="claim-agent">${labelForAgent(claim.agent)} · <span class="${typeClass}">${claim.claimType}</span></span><span class="claim-text claim-text--${textTone}">${claim.text}</span>`;
    button.addEventListener('click', () => {
      state.selectedClaimId = claim.id;
      state.selectedSeedId = claim.grounding[0]?.seedId || null;
      const packet = packetBySeed(state.selectedSeedId);
      if (packet) state.objectId = packet.id;
      els.openDeepRead.hidden = !packet;
      renderClaims();
      renderInterrogation(claim);
      drawGraph();
    });
    li.append(button);
    els.claimList.append(li);
  }

  const selected = claims.find((claim) => claim.id === state.selectedClaimId);
  if (selected) renderInterrogation(selected);
  else if (state.view !== 'residency') els.interrogation.hidden = true;
}

function renderRequestInterrogation(item) {
  els.interrogation.hidden = false;
  const rows = [
    ['Object / document', `${item.title} (${item.accessionNumber})`],
    ['Why see this in person?', item.whyRequest],
    ['Generating contradiction', item.generatingContradiction],
    ['Onsite research questions', (item.onsiteQuestions || []).join(' | ')],
    ['What the simulation could not resolve', (item.simulationCouldNotResolve || []).join('; ') || '—'],
    ['Source link', item.sourceUrl],
    ['Chain', 'SOURCE → INTERPRETATION → UNCERTAINTY → ONSITE QUESTION']
  ];
  els.interrogationBody.replaceChildren();
  for (const [dt, dd] of rows) {
    const term = document.createElement('dt');
    term.textContent = dt;
    const def = document.createElement('dd');
    if (dt === 'Source link') {
      const a = document.createElement('a');
      a.href = dd;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = dd;
      def.append(a);
    } else {
      def.textContent = dd;
    }
    els.interrogationBody.append(term, def);
  }
}

function renderInterrogation(claim) {
  els.interrogation.hidden = false;
  const rows = [
    ['Object / document', claim.grounding.map((g) => g.seedId).join(', ')],
    ['Agent', labelForAgent(claim.agent)],
    ['Interpretive claim', claim.text],
    ['Claim type', claim.claimType === 'FABRICATION_TEST' ? 'FABRICATION_TEST (intentionally unsupported — not a source fact)' : claim.claimType],
    ['Evidence', claim.grounding.map((g) => `${g.seedId}.${g.field}`).join('; ')],
    ['Who agrees', claim.agreesWith.map(labelForAgent).join(', ') || 'None named'],
    ['Who contradicts', claim.contradicts.map(labelForAgent).join(', ') || 'None named'],
    ['What would change this interpretation?', claim.whatWouldChangeMind || '—'],
    ['Can the public record establish this?', claim.publicRecordEstablishes ? 'Yes (within cited fields)' : 'Not from the cited public-record fields alone'],
    ['Why might this need to be seen in person?', claim.requiresPhysicalObject ? 'Physical qualities or staff knowledge may change the reading.' : 'Not necessarily required for this claim.'],
    ['Onsite research question', claim.residencyQuestion || '—'],
    ['Chain', 'SOURCE → INTERPRETATION → UNCERTAINTY → ONSITE QUESTION']
  ];
  els.interrogationBody.replaceChildren();
  for (const [dt, dd] of rows) {
    const term = document.createElement('dt');
    term.textContent = dt;
    const def = document.createElement('dd');
    def.textContent = dd;
    els.interrogationBody.append(term, def);
  }
}

function renderSim() {
  renderRoundSwitch();
  drawGraph();
  renderClaims();
}

function clearAgentPanel() {
  state.agentId = null;
  els.panelKicker.textContent = 'Select an agent';
  els.panelHeading.textContent = 'Bounded reading';
  els.panelEmpty.hidden = false;
  els.panelBody.hidden = true;
  els.panelBody.replaceChildren();
  els.panel.className = 'panel agent-panel';
  els.ledgerInterpretation.textContent = 'Select an agent';
  els.ledgerInterpretation.className = 'ledger__value';
  els.ledgerUncertainty.textContent = '—';
  els.ledgerUncertainty.className = 'ledger__value';
  els.ledgerOnsite.textContent = '—';
  els.ledgerOnsite.className = 'ledger__value';
  els.objectCore.classList.remove('is-split');
  for (const node of els.agentNodes.querySelectorAll('.agent-node')) {
    node.setAttribute('aria-pressed', 'false');
    node.classList.remove('is-agreeing', 'is-contradicting');
  }
  drawRelations();
}

function resetScene() {
  state.selectedClaimId = null;
  state.selectedSeedId = null;
  state.objectId = null;
  state.agentId = null;
  state.onsiteOpen = false;

  els.deepRead.hidden = true;
  els.deepRead.classList.remove('is-inspected');

  els.openDeepRead.hidden = true;
  els.onsiteList.hidden = true;
  els.onsiteCta.setAttribute('aria-expanded', 'false');

  clearAgentPanel();
  renderSim();
}

function fieldBlock(title, contentNode) {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  const heading = document.createElement('h3');
  heading.textContent = title;
  wrap.append(heading, contentNode);
  return wrap;
}

function renderAgentPanel() {
  const packet = currentPacket();
  const agent = packet.agents[state.agentId];
  if (!agent) return;
  const label = labelForAgent(state.agentId);
  const voice = voiceForAgent(state.agentId);
  els.panelKicker.textContent = packet.trialLabel;
  els.panelHeading.textContent = label;
  els.panelEmpty.hidden = true;
  els.panelBody.hidden = false;
  els.panelBody.replaceChildren();
  els.panel.className = `panel agent-panel agent-panel--${state.agentId}`;

  const portrait = portraitForAgent(state.agentId);
  if (portrait) {
    const portraitImg = document.createElement('img');
    portraitImg.className = 'agent-panel__portrait';
    portraitImg.src = portrait;
    portraitImg.alt = `${label} portrait`;
    portraitImg.loading = 'lazy';
    els.panelBody.append(portraitImg);
  }

  if (voice) {
    const voiceLine = document.createElement('p');
    voiceLine.className = 'agent-voice';
    voiceLine.textContent = voice;
    els.panelBody.append(voiceLine);
  }

  if (agent.fabrication) {
    const banner = document.createElement('p');
    banner.className = 'badge badge--fabricate';
    banner.textContent = 'FABRICATION_TEST · unsupported reconstruction (not a source fact)';
    els.panelBody.append(banner);
  }

  for (const [title, value, tone] of [
    ['Observation', agent.observation, 'interpretive'],
    ['Interpretive claim', agent.claim, 'interpretive'],
    ['Uncertainty', agent.uncertainty, 'interpretive'],
    ['Onsite research question', agent.onsiteQuestion, 'interpretive']
  ]) {
    const p = document.createElement('p');
    p.className = `field-copy field-copy--${tone}`;
    p.textContent = value;
    els.panelBody.append(fieldBlock(title, p));
  }

  const evidenceList = document.createElement('ul');
  evidenceList.className = 'evidence-list evidence-list--source';
  for (const item of agent.evidence) {
    const li = document.createElement('li');
    li.textContent = `${item.text} (${item.sourceRef})`;
    evidenceList.append(li);
  }
  els.panelBody.append(fieldBlock('Evidence / source grounding', evidenceList));

  const agreeRow = document.createElement('div');
  agreeRow.className = 'badge-row';
  for (const id of agent.agreesWith) {
    const badge = document.createElement('span');
    badge.className = 'badge badge--agree';
    badge.textContent = `Agrees: ${labelForAgent(id)}`;
    agreeRow.append(badge);
  }
  if (!agent.agreesWith.length) agreeRow.textContent = 'None named';
  els.panelBody.append(fieldBlock('Agreement(s)', agreeRow));

  const contradictRow = document.createElement('div');
  contradictRow.className = 'badge-row';
  for (const id of agent.contradicts) {
    const badge = document.createElement('span');
    badge.className = 'badge badge--contradict';
    badge.textContent = `Contradicts: ${labelForAgent(id)}`;
    contradictRow.append(badge);
  }
  if (!agent.contradicts.length) contradictRow.textContent = 'None named';
  els.panelBody.append(fieldBlock('Contradiction(s)', contradictRow));

  els.ledgerInterpretation.textContent = agent.claim;
  els.ledgerInterpretation.className = 'ledger__value ledger__value--interpretive';
  els.ledgerUncertainty.textContent = agent.uncertainty;
  els.ledgerUncertainty.className = 'ledger__value ledger__value--interpretive';
  els.ledgerOnsite.textContent = agent.onsiteQuestion;
  els.ledgerOnsite.className = 'ledger__value ledger__value--interpretive';
  els.ledgerSource.className = 'ledger__value ledger__value--source';

  for (const node of els.agentNodes.querySelectorAll('.agent-node')) {
    const id = node.dataset.agent;
    node.setAttribute('aria-pressed', String(id === state.agentId));
    node.classList.toggle('is-agreeing', agent.agreesWith.includes(id));
    node.classList.toggle('is-contradicting', agent.contradicts.includes(id));
  }
  els.objectCore.classList.toggle('is-split', agent.contradicts.length > 0);
  drawRelations();
}

function curvePath(from, to, bend = 40) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - bend;
  return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
}

function drawRelations() {
  const svg = els.relationLayer;
  svg.replaceChildren();
  if (!state.agentId) return;
  const packet = currentPacket();
  const agent = packet.agents[state.agentId];
  if (!agent) return;
  const origin = AGENT_POSITIONS[state.agentId];
  const ground = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  ground.setAttribute('class', 'agree-path');
  ground.setAttribute('d', curvePath(origin, CENTER, 20));
  ground.setAttribute('aria-label', 'Grounded to object');
  ground.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'title')).textContent = 'Grounded to object';
  svg.append(ground);
  for (const otherId of agent.agreesWith) {
    if (!AGENT_POSITIONS[otherId]) continue;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'agree-path');
    path.setAttribute('d', curvePath(origin, AGENT_POSITIONS[otherId], 55));
    path.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'title')).textContent = `Agreement with ${labelForAgent(otherId)}`;
    svg.append(path);
  }
  for (const otherId of agent.contradicts) {
    if (!AGENT_POSITIONS[otherId]) continue;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'contradict-path');
    path.setAttribute('d', curvePath(origin, AGENT_POSITIONS[otherId], -35));
    path.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'title')).textContent = `Contradiction with ${labelForAgent(otherId)}`;
    svg.append(path);
  }
}

function renderObjectTabs() {
  els.objectTabs.replaceChildren();
  for (const id of state.trial.objects) {
    const packet = state.packets.get(id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'object-tab';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(id === state.objectId));
    button.textContent = packet.trialLabel;
    button.addEventListener('click', () => {
      state.objectId = id;
      state.agentId = null;
      state.onsiteOpen = false;
      renderObjectTabs();
      renderAgentNodes();
      clearAgentPanel();
      renderObject();
    });
    els.objectTabs.append(button);
  }
}

function renderAgentNodes() {
  els.agentNodes.replaceChildren();
  for (const agent of state.trial.agents.filter((item) => item.id !== 'museum')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `agent-node agent-node--${agent.id}`;
    button.dataset.agent = agent.id;
    button.setAttribute('aria-pressed', String(agent.id === state.agentId));
    button.title = agent.voice || agent.label;
    const label = document.createElement('span');
    label.className = 'agent-node__label';
    label.textContent = agent.label;
    const portrait = portraitForAgent(agent.id);
    if (portrait) {
      const image = document.createElement('img');
      image.className = 'agent-node__portrait';
      image.src = portrait;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      button.append(image);
    }
    button.append(label);
    if (agent.voice) {
      const hint = document.createElement('span');
      hint.className = 'agent-node__voice';
      hint.textContent = agent.voice.split('—')[0].trim();
      button.append(hint);
    }
    if (agent.id === 'counterfeit') button.classList.add('is-fabricated');
    button.addEventListener('click', () => {
      state.agentId = agent.id;
      renderAgentPanel();
      els.panel.focus({ preventScroll: false });
    });
    els.agentNodes.append(button);
  }
}

async function renderObject() {
  const packet = currentPacket();
  els.objectLabel.textContent = packet.trialLabel;
  els.objectTitle.textContent = packet.source.title;
  els.objectMeta.textContent = `${packet.source.accessionNumber} · ${packet.source.date || 'date unknown'}`;
  els.ledgerSource.textContent = `${packet.source.institution} · ${packet.source.accessionNumber} · ${packet.source.title}`;
  els.ledgerSource.className = 'ledger__value ledger__value--source';
  els.sourceLink.href = packet.source.publicRecordUrl;
  els.sourceLink.textContent = `Public source for ${packet.source.accessionNumber}`;

  const established = packet.archivalActor?.establishedInPublicPacket || packet.archivalActor?.knows || [];
  const notEstablished =
    packet.archivalActor?.notEstablishedInPublicPacket || packet.archivalActor?.doesNotKnow || [];
  els.archivalActor.innerHTML = `<p><strong>Established in this public packet:</strong> ${established.join(', ') || '—'}</p><p><strong>Not established in this public packet:</strong> ${notEstablished.join(', ') || '—'}</p><p class="archival-note">This describes limits of the current representation, not what museum staff know.</p>`;

  els.onsiteList.replaceChildren();
  for (const agent of state.trial.agents.filter((item) => item.id !== 'museum')) {
    const reading = packet.agents[agent.id];
    if (!reading) continue;
    const item = document.createElement('li');
    item.innerHTML = `<strong>${agent.label}:</strong> ${reading.onsiteQuestion}`;
    els.onsiteList.append(item);
  }
  els.onsiteList.hidden = !state.onsiteOpen;
  els.onsiteCta.setAttribute('aria-expanded', String(state.onsiteOpen));

  if (state.agentId) renderAgentPanel();
  else clearAgentPanel();

  const src = assetUrl(packet.representation.src);
  const svg = await fetch(src).then((response) => response.text());
  els.objectFigure.innerHTML = svg;
}

function enterSimulation() {
  els.landing.hidden = true;
  els.simShell.hidden = false;
  renderViewTabs();
  renderSim();
}

function openDeepRead() {
  els.deepRead.hidden = false;
  renderObjectTabs();
  renderAgentNodes();
  clearAgentPanel();
  renderObject();
  els.deepRead.classList.remove('is-inspected');
  // force layout so the animation reliably re-triggers
  void els.deepRead.offsetWidth;
  els.deepRead.classList.add('is-inspected');
  els.deepRead.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function init() {
  try {
    await loadAll();
    graphBackdropController = await createGraphBackdrop(
      els.graphBackdrop,
      document.querySelector('.graph-panel')
    );
    renderLanding();
    els.enterSim.addEventListener('click', enterSimulation);
    els.openDeepRead.addEventListener('click', openDeepRead);
    els.closeDeepRead.addEventListener('click', () => {
      els.deepRead.hidden = true;
      els.deepRead.classList.remove('is-inspected');
    });
    els.onsiteCta.addEventListener('click', () => {
      state.onsiteOpen = !state.onsiteOpen;
      els.onsiteList.hidden = !state.onsiteOpen;
      els.onsiteCta.setAttribute('aria-expanded', String(state.onsiteOpen));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (els.simShell.hidden) return;
      resetScene();
    });
  } catch (error) {
    document.body.innerHTML = `<main style="padding:2rem;font-family:serif"><h1>Demo failed to load</h1><p>${error.message}</p></main>`;
  }
}

init();
