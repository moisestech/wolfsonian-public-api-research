const WORLD_AGENTS = ['archivist', 'worker', 'futurist', 'propagandist'];

const ATTENTION_LABELS = {
  archivist: 'investigating provenance',
  worker: 'investigating production',
  futurist: 'investigating form',
  propagandist: 'investigating persuasion'
};

const PORTRAITS = {
  archivist: 'https://res.cloudinary.com/dck5rzi4h/image/upload/v1782901407/grants/wolfsonian/agents/archivist_enoxwd.png',
  worker: 'https://res.cloudinary.com/dck5rzi4h/image/upload/v1782901403/grants/wolfsonian/agents/worker_ofjxn0.png',
  futurist: 'https://res.cloudinary.com/dck5rzi4h/image/upload/v1782901408/grants/wolfsonian/agents/futurist_layjim.png',
  propagandist: 'https://res.cloudinary.com/dck5rzi4h/image/upload/v1782901419/grants/wolfsonian/agents/propagandist_uuwflg.png'
};

const CLAIM_TYPES = {
  archivist: 'SOURCE_SUPPORTED',
  worker: 'INFERENCE',
  futurist: 'INFERENCE',
  propagandist: 'INFERENCE'
};

const CONVERSATION = {
  futurist: {
    line: 'Streamlining turns this receiver into an image of effortless progress.',
    field: 'claim'
  },
  propagandist: {
    line: 'The luxury finish is persuasion: it makes a mass medium feel at home.',
    field: 'claim'
  },
  worker: {
    line: 'That reading says nothing about who cut, assembled, or conserved this machine.',
    field: 'claim'
  },
  archivist: {
    line: 'Progress is interpretive. The packet establishes design, date, and materials.',
    field: 'claim'
  }
};

const STARTS = {
  futurist: { x: 220, y: 110 },
  propagandist: { x: 980, y: 150 },
  worker: { x: 90, y: 520 },
  archivist: { x: 1040, y: 540 }
};

const STATIONS = {
  futurist: { x: 560, y: 250 },
  propagandist: { x: 700, y: 250 },
  worker: { x: 500, y: 430 },
  archivist: { x: 760, y: 430 }
};

const RADIO = { x: 620, y: 340 };

function languageForStage(stage) {
  if (stage === 'world' || stage === 'encounter') return 'LABEL';
  if (stage === 'conversation') return 'CONVERSATION';
  return 'RESEARCH';
}

function hintForStage(stage) {
  const hints = {
    world: 'Watch who moves toward the radio.',
    encounter: 'Four agents attend the same archival object.',
    conversation: 'Click a spoken line to inspect the claim.',
    claim: 'This is structured research, not chat.',
    evidence: 'Source language is separate from interpretation.',
    residency: 'What the public packet cannot resolve becomes an onsite question.'
  };
  return hints[stage] || '';
}

export async function loadWorldState() {
  const [packet, candidates] = await Promise.all([
    fetch('../demo/data/objects/02-sparton-radio.json').then((r) => r.json()),
    fetch('../demo/data/object-request-candidates/sim-001.json').then((r) => r.json())
  ]);

  const residency = (candidates.candidates || []).find((item) => item.seedId === 'WOLF-002');

  const agents = WORLD_AGENTS.map((id) => {
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
      agreesWith: reading.agreesWith.filter((other) => WORLD_AGENTS.includes(other)),
      contradicts: reading.contradicts.filter((other) => WORLD_AGENTS.includes(other)),
      uncertainty: reading.uncertainty,
      onsiteQuestion: reading.onsiteQuestion,
      claimType: CLAIM_TYPES[id],
      conversationLine: CONVERSATION[id].line
    };
  });

  return {
    stage: 'world',
    simulationTime: 0,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    record: {
      id: packet.seedId,
      title: packet.source.title,
      accessionNumber: packet.source.accessionNumber,
      date: packet.source.date,
      creator: packet.source.creator,
      materials: packet.source.materials,
      publicRecordUrl: packet.source.publicRecordUrl,
      established: packet.archivalActor.establishedInPublicPacket,
      notEstablished: packet.archivalActor.notEstablishedInPublicPacket,
      x: RADIO.x,
      y: RADIO.y
    },
    agents,
    residency,
    activeClaimId: null,
    conversationLine: null,
    speakingOrder: ['futurist', 'propagandist', 'worker', 'archivist'],
    spokenIndex: -1,
    radio: RADIO,
    stations: STATIONS
  };
}

export { languageForStage, hintForStage, WORLD_AGENTS };
