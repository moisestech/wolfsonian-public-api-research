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
  els.landingStats.textContent = `${c.records} source records · ${c.entities} extracted entities · ${c.relationships} relationships · ${c.agents} interpretive agents · ${c.unresolvedContradictions} unresolved contradictions`;
  els.landingNote.textContent = `${state.trial.dataNote} ${state.trial.representationNote} Capacity ${state.manifest.capacity.shippedRecords}/${state.manifest.capacity.maxRecords}.`;
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
    svg.append(path);
  }

  for (const node of state.graph.nodes) {
    const pos = positions.get(node.id);
    if (!pos) continue;
    if (node.kind !== 'record' && (state.view === 'archive' || state.view === 'residency')) {
      // keep concept marks lighter in archive/residency
    }
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${pos.x} ${pos.y})`);
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', node.kind === 'record' ? '18' : '6');
    circle.setAttribute(
      'class',
      `graph-node graph-node--${node.kind}${claimSeeds.has(node.id) ? ' is-active' : ''}`
    );
    group.append(circle);
    if (node.kind === 'record') {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('y', '32');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'graph-label');
      text.textContent = node.seedId.replace('WOLF-', '');
      group.append(text);
      group.style.cursor = 'pointer';
      group.addEventListener('click', () => {
        state.selectedSeedId = node.seedId;
        const packet = packetBySeed(node.seedId);
        if (packet) {
          state.objectId = packet.id;
          els.openDeepRead.hidden = false;
        }
        renderClaims();
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
  els.graphCaption.textContent = captions[state.view];
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
    button.className = `claim-item kind-${claim.claimType}${state.selectedClaimId === claim.id ? ' is-selected' : ''}`;
    button.innerHTML = `<span class="claim-agent">${labelForAgent(claim.agent)} · ${claim.claimType}</span><span class="claim-text">${claim.text}</span>`;
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
    ['Onsite research questions', item.onsiteQuestions.join(' | ')],
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
    ['Claim type', claim.claimType],
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
  els.ledgerInterpretation.textContent = 'Select an agent';
  els.ledgerUncertainty.textContent = '—';
  els.ledgerOnsite.textContent = '—';
  els.objectCore.classList.remove('is-split');
  for (const node of els.agentNodes.querySelectorAll('.agent-node')) {
    node.setAttribute('aria-pressed', 'false');
    node.classList.remove('is-agreeing', 'is-contradicting');
  }
  drawRelations();
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
  els.panelKicker.textContent = packet.trialLabel;
  els.panelHeading.textContent = label;
  els.panelEmpty.hidden = true;
  els.panelBody.hidden = false;
  els.panelBody.replaceChildren();

  if (agent.fabrication) {
    const banner = document.createElement('p');
    banner.className = 'badge badge--fabricate';
    banner.textContent = 'Unsupported reconstruction · fabrication';
    els.panelBody.append(banner);
  }

  for (const [title, value] of [
    ['Observation', agent.observation],
    ['Interpretive claim', agent.claim],
    ['Uncertainty', agent.uncertainty],
    ['Onsite research question', agent.onsiteQuestion]
  ]) {
    const p = document.createElement('p');
    p.textContent = value;
    els.panelBody.append(fieldBlock(title, p));
  }

  const evidenceList = document.createElement('ul');
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
    badge.textContent = labelForAgent(id);
    agreeRow.append(badge);
  }
  if (!agent.agreesWith.length) agreeRow.textContent = 'None named';
  els.panelBody.append(fieldBlock('Agreement(s)', agreeRow));

  const contradictRow = document.createElement('div');
  contradictRow.className = 'badge-row';
  for (const id of agent.contradicts) {
    const badge = document.createElement('span');
    badge.className = 'badge badge--contradict';
    badge.textContent = labelForAgent(id);
    contradictRow.append(badge);
  }
  if (!agent.contradicts.length) contradictRow.textContent = 'None named';
  els.panelBody.append(fieldBlock('Contradiction(s)', contradictRow));

  els.ledgerInterpretation.textContent = agent.claim;
  els.ledgerUncertainty.textContent = agent.uncertainty;
  els.ledgerOnsite.textContent = agent.onsiteQuestion;

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
  svg.append(ground);
  for (const otherId of agent.agreesWith) {
    if (!AGENT_POSITIONS[otherId]) continue;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'agree-path');
    path.setAttribute('d', curvePath(origin, AGENT_POSITIONS[otherId], 55));
    svg.append(path);
  }
  for (const otherId of agent.contradicts) {
    if (!AGENT_POSITIONS[otherId]) continue;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'contradict-path');
    path.setAttribute('d', curvePath(origin, AGENT_POSITIONS[otherId], -35));
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
    button.className = 'agent-node';
    button.dataset.agent = agent.id;
    button.setAttribute('aria-pressed', String(agent.id === state.agentId));
    button.textContent = agent.label;
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
  els.sourceLink.href = packet.source.publicRecordUrl;
  els.sourceLink.textContent = `Public source for ${packet.source.accessionNumber}`;

  const knows = packet.archivalActor?.knows || [];
  const unknown = packet.archivalActor?.doesNotKnow || [];
  els.archivalActor.innerHTML = `<p><strong>I know:</strong> ${knows.join(', ') || '—'}</p><p><strong>I do not know:</strong> ${unknown.join(', ') || '—'}</p>`;

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
  els.deepRead.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function init() {
  try {
    await loadAll();
    renderLanding();
    els.enterSim.addEventListener('click', enterSimulation);
    els.openDeepRead.addEventListener('click', openDeepRead);
    els.closeDeepRead.addEventListener('click', () => {
      els.deepRead.hidden = true;
    });
    els.onsiteCta.addEventListener('click', () => {
      state.onsiteOpen = !state.onsiteOpen;
      els.onsiteList.hidden = !state.onsiteOpen;
      els.onsiteCta.setAttribute('aria-expanded', String(state.onsiteOpen));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && state.agentId) clearAgentPanel();
    });
  } catch (error) {
    document.body.innerHTML = `<main style="padding:2rem;font-family:serif"><h1>Demo failed to load</h1><p>${error.message}</p></main>`;
  }
}

init();
