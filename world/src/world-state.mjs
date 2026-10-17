/** Embodied readers only. Archivist is a constraint, not a walker. Propagandist deferred. */
const EMBODIED_AGENTS = ['futurist', 'worker'];

const ATTENTION_LABELS = {
  worker: 'reading labor / making',
  futurist: 'reading form as progress'
};

/** Optional progressive enhancement — critical path uses discs when unavailable. */
const PORTRAITS = {
  worker: '',
  futurist: ''
};

const CLAIM_TYPES = {
  worker: 'INFERENCE',
  futurist: 'INFERENCE'
};

/** Scarce speech: two opposed fragments only, after silent opposition. */
const CONVERSATION = {
  futurist: {
    line: 'Streamlining turns this receiver into an image of effortless progress.',
    field: 'claim'
  },
  worker: {
    line: 'That reading does not establish whose work cut, assembled, or conserved this machine.',
    field: 'claim'
  }
};

/** Opposite axis: Futurist above (form), Worker below (labor). */
const STARTS = {
  futurist: { x: 280, y: 90 },
  worker: { x: 920, y: 620 }
};

const STATIONS = {
  futurist: { x: 620, y: 210 },
  worker: { x: 620, y: 480 }
};

const RADIO = { x: 620, y: 340 };

function languageForStage(stage) {
  if (stage === 'world' || stage === 'encounter') return 'LABEL';
  if (stage === 'conversation') return 'CONVERSATION';
  return 'RESEARCH';
}

function surfaceForStage(stage) {
  if (stage === 'claim' || stage === 'evidence' || stage === 'residency') return 'RESEARCH';
  return 'WORLD';
}

function hintForStage(stage) {
  const hints = {
    world: '',
    encounter: '',
    conversation: 'Select an interpretive fragment to verify.',
    claim: 'Claim type is interpretive until grounded.',
    evidence: 'Established / inference / not established in this packet.',
    residency: 'What the public packet cannot resolve becomes an onsite question.'
  };
  return hints[stage] || '';
}

function buildAgent(id, packet) {
  const reading = packet.agents[id];
  return {
    id,
    role: id,
    label: id[0].toUpperCase() + id.slice(1),
    x: STARTS[id].x,
    y: STARTS[id].y,
    vx: 0,
    vy: 0,
    destination: { ...STARTS[id] },
    state: 'wandering',
    attentionTarget: null,
    attentionLabel: ATTENTION_LABELS[id],
    portrait: PORTRAITS[id],
    observation: reading.observation,
    claim: reading.claim,
    evidence: reading.evidence,
    agreesWith: (reading.agreesWith || []).filter((other) => EMBODIED_AGENTS.includes(other)),
    contradicts: (reading.contradicts || []).filter((other) => EMBODIED_AGENTS.includes(other)),
    uncertainty: reading.uncertainty,
    onsiteQuestion: reading.onsiteQuestion,
    claimType: CLAIM_TYPES[id],
    conversationLine: CONVERSATION[id].line
  };
}

function createWorldFromPacket(packet, residency, reducedMotion) {
  return {
    stage: 'world',
    simulationTime: 0,
    reducedMotion,
    record: {
      id: packet.seedId,
      title: packet.source.title,
      accessionNumber: packet.source.accessionNumber,
      date: packet.source.date,
      creator: packet.source.creator,
      materials: packet.source.materials,
      publicRecordUrl: packet.source.publicRecordUrl,
      citedAt: packet.source.citedAt || null,
      established: packet.archivalActor.establishedInPublicPacket,
      notEstablished: packet.archivalActor.notEstablishedInPublicPacket,
      x: RADIO.x,
      y: RADIO.y
    },
    agents: EMBODIED_AGENTS.map((id) => buildAgent(id, packet)),
    /** Non-embodied provenance force — drawn as ring/tether, never a roaming token. */
    archivistConstraint: {
      kind: 'provenance_gate',
      label: 'Archivist',
      tension: 0,
      pulse: 0
    },
    contradiction: {
      active: false,
      formedAt: null,
      selectable: false
    },
    residency,
    activeClaimId: null,
    conversationLine: null,
    speakingOrder: ['futurist', 'worker'],
    spokenIndex: -1,
    radio: { ...RADIO },
    stations: {
      futurist: { ...STATIONS.futurist },
      worker: { ...STATIONS.worker }
    },
    _packet: packet,
    _residency: residency
  };
}

export async function loadWorldState() {
  const [packet, candidates] = await Promise.all([
    fetch('../demo/data/objects/02-sparton-radio.json').then((r) => r.json()),
    fetch('../demo/data/object-request-candidates/sim-001.json').then((r) => r.json())
  ]);

  const residency = (candidates.candidates || []).find((item) => item.seedId === 'WOLF-002');
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  return createWorldFromPacket(packet, residency, reducedMotion);
}

/** Full guided-path reset without re-fetching packets. */
export function resetWorldState(world) {
  const next = createWorldFromPacket(world._packet, world._residency, world.reducedMotion);
  Object.keys(world).forEach((key) => {
    delete world[key];
  });
  Object.assign(world, next);
  return world;
}

export {
  languageForStage,
  surfaceForStage,
  hintForStage,
  createWorldFromPacket,
  EMBODIED_AGENTS,
  RADIO,
  STATIONS,
  STARTS
};
