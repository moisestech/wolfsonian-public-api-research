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
  packets: new Map(),
  objectId: null,
  agentId: null,
  onsiteOpen: false
};

const els = {
  title: document.getElementById('trial-title'),
  subtitle: document.getElementById('trial-subtitle'),
  tagline: document.getElementById('trial-tagline'),
  disclaimer: document.getElementById('trial-disclaimer'),
  objectTabs: document.getElementById('object-tabs'),
  objectLabel: document.getElementById('object-label'),
  objectFigure: document.getElementById('object-figure'),
  objectTitle: document.getElementById('object-title'),
  objectMeta: document.getElementById('object-meta'),
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
  dataNote: document.getElementById('data-note'),
  representationNote: document.getElementById('representation-note'),
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

function assetUrl(relativeFromObjectJson) {
  // representation.src is authored as ../assets/objects/....svg from demo/data/objects/
  return relativeFromObjectJson.replace(/^\.\.\//, './');
}

async function loadTrial() {
  const trial = await fetch('./data/trial-001.json').then((response) => {
    if (!response.ok) throw new Error(`Failed to load trial manifest (${response.status})`);
    return response.json();
  });

  const packets = await Promise.all(
    trial.objects.map(async (id) => {
      const packet = await fetch(`./data/objects/${id}.json`).then((response) => {
        if (!response.ok) throw new Error(`Failed to load packet ${id}`);
        return response.json();
      });
      return [id, packet];
    })
  );

  state.trial = trial;
  state.packets = new Map(packets);
  state.objectId = trial.objects[0];
}

function renderHeader() {
  els.title.textContent = state.trial.title;
  els.subtitle.textContent = state.trial.subtitle;
  els.tagline.textContent = state.trial.tagline;
  els.disclaimer.textContent = state.trial.disclaimer;
  els.dataNote.textContent = state.trial.dataNote;
  els.representationNote.textContent = state.trial.representationNote;
}

function renderObjectTabs() {
  els.objectTabs.replaceChildren();
  for (const id of state.trial.objects) {
    const packet = state.packets.get(id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'object-tab';
    button.id = `tab-${id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(id === state.objectId));
    button.setAttribute('aria-controls', 'object-core');
    button.textContent = packet.trialLabel;
    button.addEventListener('click', () => selectObject(id));
    els.objectTabs.append(button);
  }
}

function renderAgentNodes() {
  els.agentNodes.replaceChildren();
  for (const agent of state.trial.agents) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'agent-node';
    button.dataset.agent = agent.id;
    button.setAttribute('aria-pressed', String(agent.id === state.agentId));
    button.setAttribute('aria-controls', 'agent-panel');
    button.textContent = agent.label;
    if (agent.id === 'counterfeit') button.classList.add('is-fabricated');
    button.addEventListener('click', () => selectAgent(agent.id));
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

  for (const button of els.objectTabs.querySelectorAll('.object-tab')) {
    button.setAttribute('aria-selected', String(button.id === `tab-${packet.id}`));
  }

  renderOnsiteList();

  if (state.agentId) {
    renderAgentPanel();
  } else {
    clearAgentPanel();
  }

  const src = assetUrl(packet.representation.src);
  const svg = await fetch(src).then((response) => {
    if (!response.ok) throw new Error(`Missing representation ${src}`);
    return response.text();
  });
  els.objectFigure.innerHTML = svg;
  const svgEl = els.objectFigure.querySelector('svg');
  if (svgEl) {
    svgEl.setAttribute('aria-label', packet.representation.caption || packet.source.title);
  }

  drawRelations();
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

  const observation = document.createElement('p');
  observation.textContent = agent.observation;
  els.panelBody.append(fieldBlock('Observation', observation));

  const claim = document.createElement('p');
  claim.textContent = agent.claim;
  els.panelBody.append(fieldBlock('Interpretive claim', claim));

  const evidenceList = document.createElement('ul');
  for (const item of agent.evidence) {
    const li = document.createElement('li');
    li.textContent = `${item.text} (${item.sourceRef})`;
    evidenceList.append(li);
  }
  els.panelBody.append(fieldBlock('Evidence / source grounding', evidenceList));

  const agreeRow = document.createElement('div');
  agreeRow.className = 'badge-row';
  if (agent.agreesWith.length === 0) {
    const none = document.createElement('span');
    none.textContent = 'None named';
    agreeRow.append(none);
  } else {
    for (const id of agent.agreesWith) {
      const badge = document.createElement('span');
      badge.className = 'badge badge--agree';
      badge.textContent = labelForAgent(id);
      agreeRow.append(badge);
    }
  }
  els.panelBody.append(fieldBlock('Agreement(s)', agreeRow));

  const contradictRow = document.createElement('div');
  contradictRow.className = 'badge-row';
  if (agent.contradicts.length === 0) {
    const none = document.createElement('span');
    none.textContent = 'None named';
    contradictRow.append(none);
  } else {
    for (const id of agent.contradicts) {
      const badge = document.createElement('span');
      badge.className = 'badge badge--contradict';
      badge.textContent = labelForAgent(id);
      contradictRow.append(badge);
    }
  }
  els.panelBody.append(fieldBlock('Contradiction(s)', contradictRow));

  const uncertainty = document.createElement('p');
  uncertainty.textContent = agent.uncertainty;
  els.panelBody.append(fieldBlock('Uncertainty', uncertainty));

  const confidenceWrap = document.createElement('div');
  confidenceWrap.className = 'confidence';
  const track = document.createElement('div');
  track.className = 'confidence__track';
  const fill = document.createElement('div');
  fill.className = 'confidence__fill';
  if (agent.confidence < 0.35) fill.classList.add('is-low');
  fill.style.width = `${Math.round(agent.confidence * 100)}%`;
  track.append(fill);
  const confLabel = document.createElement('span');
  confLabel.className = 'badge';
  confLabel.textContent = `${Math.round(agent.confidence * 100)}%`;
  confidenceWrap.append(track, confLabel);
  els.panelBody.append(fieldBlock('Confidence', confidenceWrap));

  const onsite = document.createElement('p');
  onsite.textContent = agent.onsiteQuestion;
  els.panelBody.append(fieldBlock('Onsite research question', onsite));

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
  const origin = AGENT_POSITIONS[state.agentId];

  const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  halo.setAttribute('class', 'uncertain-halo');
  halo.setAttribute('cx', String(CENTER.x));
  halo.setAttribute('cy', String(CENTER.y));
  halo.setAttribute('r', String(78 + (1 - agent.confidence) * 36));
  svg.append(halo);

  const ground = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  ground.setAttribute('class', 'agree-path');
  ground.setAttribute('d', curvePath(origin, CENTER, 20));
  svg.append(ground);

  for (const otherId of agent.agreesWith) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'agree-path');
    path.setAttribute('d', curvePath(origin, AGENT_POSITIONS[otherId], 55));
    svg.append(path);
  }

  for (const otherId of agent.contradicts) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'contradict-path');
    path.setAttribute('d', curvePath(origin, AGENT_POSITIONS[otherId], -35));
    svg.append(path);
  }
}

function renderOnsiteList() {
  const packet = currentPacket();
  els.onsiteList.replaceChildren();
  for (const agent of state.trial.agents) {
    const reading = packet.agents[agent.id];
    const item = document.createElement('li');
    item.innerHTML = `<strong>${agent.label}:</strong> ${reading.onsiteQuestion}`;
    els.onsiteList.append(item);
  }
  els.onsiteList.hidden = !state.onsiteOpen;
  els.onsiteCta.setAttribute('aria-expanded', String(state.onsiteOpen));
}

function selectObject(objectId) {
  state.objectId = objectId;
  state.agentId = null;
  state.onsiteOpen = false;
  renderObjectTabs();
  renderAgentNodes();
  clearAgentPanel();
  renderObject();
}

function selectAgent(agentId) {
  state.agentId = agentId;
  renderAgentPanel();
  els.panel.focus({ preventScroll: false });
}

function bindGlobalKeys() {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.agentId) {
      clearAgentPanel();
    }
  });

  els.onsiteCta.addEventListener('click', () => {
    state.onsiteOpen = !state.onsiteOpen;
    renderOnsiteList();
  });
}

async function init() {
  try {
    await loadTrial();
    renderHeader();
    renderObjectTabs();
    renderAgentNodes();
    bindGlobalKeys();
    await renderObject();
  } catch (error) {
    document.body.innerHTML = `<main style="padding:2rem;font-family:serif"><h1>Demo failed to load</h1><p>${error.message}</p></main>`;
  }
}

init();
