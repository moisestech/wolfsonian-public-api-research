/** Pure helpers for deterministic dramaturgy and Node tests. */

export const MAX_SIM_DT = 1 / 30;
export const SILENT_HOLD_SECONDS = 6;

export function clampSimDt(rawDt) {
  if (!Number.isFinite(rawDt) || rawDt < 0) return 0;
  return Math.min(MAX_SIM_DT, rawDt);
}

export function canEnterConversation(world) {
  return Boolean(world?.contradiction?.selectable);
}

export function canOpenClaim(world) {
  return world?.stage === 'conversation' && canEnterConversation(world);
}

/**
 * Guarded stage transitions for the guided path.
 * Returns { ok, reason } without mutating when invalid.
 */
export function requestStage(world, nextStage) {
  const order = ['world', 'encounter', 'conversation', 'claim', 'evidence', 'residency'];
  if (!order.includes(nextStage)) {
    return { ok: false, reason: 'unknown_stage' };
  }
  if (nextStage === 'conversation' && !canEnterConversation(world)) {
    return { ok: false, reason: 'contradiction_required' };
  }
  if ((nextStage === 'claim' || nextStage === 'evidence' || nextStage === 'residency') && !canEnterConversation(world)) {
    return { ok: false, reason: 'contradiction_required' };
  }
  if (nextStage === 'claim' && world.stage !== 'conversation' && world.stage !== 'claim') {
    // Allow claim from conversation only (or already in research stack).
    if (!['conversation', 'claim', 'evidence'].includes(world.stage)) {
      return { ok: false, reason: 'claim_before_conversation' };
    }
  }
  return { ok: true };
}

export function eventTrace(world) {
  return {
    t: Number(world.simulationTime.toFixed(3)),
    stage: world.stage,
    contradiction: Boolean(world.contradiction?.active),
    selectable: Boolean(world.contradiction?.selectable),
    spokenIndex: world.spokenIndex,
    agents: world.agents.map((a) => ({
      id: a.id,
      state: a.state,
      x: Math.round(a.x),
      y: Math.round(a.y)
    }))
  };
}

/**
 * Build inspectable provenance model for Research View.
 * Packet limits ≠ proof that underlying history does not exist.
 */
export function buildEvidenceViewModel(record, agent) {
  if (!record) {
    return {
      accessionLine: '',
      materials: '',
      citedAt: null,
      publicRecordUrl: '',
      established: [],
      inference: [],
      claimType: null,
      supportingEvidence: [],
      notEstablished: [],
      onsiteQuestion: '',
      note: 'Missing record.'
    };
  }

  const evidenceRows = Array.isArray(agent?.evidence)
    ? agent.evidence.map((row) => ({
        text: row?.text || '',
        sourceRef: row?.sourceRef || ''
      }))
    : [];

  return {
    accessionLine: [record.accessionNumber, record.creator, record.date].filter(Boolean).join(' · '),
    materials: record.materials || '',
    citedAt: record.citedAt || null,
    publicRecordUrl: record.publicRecordUrl || '',
    established: [...(record.established || [])],
    inference: agent?.claim ? [agent.claim] : [],
    claimType: agent?.claimType || null,
    supportingEvidence: evidenceRows,
    notEstablished: [...(record.notEstablished || [])],
    onsiteQuestion: agent?.onsiteQuestion || '',
    note:
      'NOT ESTABLISHED describes limits of this public packet, not proof that the museum lacks the information.'
  };
}
