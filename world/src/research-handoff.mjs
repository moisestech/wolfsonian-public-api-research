/**
 * Typed navigation contract between Living World inspector and Research Console.
 * Only stable public-corpus identifiers — never arbitrary paths or executable values.
 */

export const APPROVED_OBJECT_IDS = Object.freeze(['WOLF-002']);

export const APPROVED_READER_IDS = Object.freeze(['futurist', 'worker']);

/** Claim IDs currently equal embodied reader IDs in World 0.1A. */
export const APPROVED_CLAIM_IDS = APPROVED_READER_IDS;

export const RESEARCH_CONSOLE_PATH = '/research-console/';

/**
 * @typedef {object} ResearchHandoff
 * @property {string} objectId
 * @property {string} claimId
 * @property {string} readerId
 * @property {string} sourceRevision
 * @property {string} [sceneCheckpoint]
 */

/**
 * @param {unknown} value
 * @param {readonly string[]} allowed
 */
function isAllowedId(value, allowed) {
  return typeof value === 'string' && allowed.includes(value);
}

/**
 * Build a validated handoff from world state. Returns null if required fields missing.
 * @param {object} world
 * @returns {ResearchHandoff | null}
 */
export function buildHandoffFromWorld(world) {
  if (!world?.record?.id) return null;
  const objectId = world.record.id;
  const claimId = world.activeClaimId || 'futurist';
  const readerId = claimId;
  const sourceRevision = world.record.citedAt || 'unknown';
  const sceneCheckpoint = world.stage || undefined;

  const handoff = { objectId, claimId, readerId, sourceRevision, sceneCheckpoint };
  return validateHandoff(handoff).ok ? handoff : null;
}

/**
 * @param {Partial<ResearchHandoff> | URLSearchParams | Record<string, string>} input
 * @returns {{ ok: true, handoff: ResearchHandoff } | { ok: false, reason: string }}
 */
export function validateHandoff(input) {
  const raw =
    input instanceof URLSearchParams
      ? Object.fromEntries(input.entries())
      : input && typeof input === 'object'
        ? input
        : {};

  const objectId = raw.objectId;
  const claimId = raw.claimId;
  const readerId = raw.readerId || claimId;
  const sourceRevision = raw.sourceRevision;
  const sceneCheckpoint = raw.sceneCheckpoint;

  if (!isAllowedId(objectId, APPROVED_OBJECT_IDS)) {
    return { ok: false, reason: 'invalid_object_id' };
  }
  if (!isAllowedId(claimId, APPROVED_CLAIM_IDS)) {
    return { ok: false, reason: 'invalid_claim_id' };
  }
  if (!isAllowedId(readerId, APPROVED_READER_IDS)) {
    return { ok: false, reason: 'invalid_reader_id' };
  }
  if (typeof sourceRevision !== 'string' || !sourceRevision.trim() || sourceRevision.length > 64) {
    return { ok: false, reason: 'invalid_source_revision' };
  }
  if (looksLikeUnsafeParam(objectId) || looksLikeUnsafeParam(claimId) || looksLikeUnsafeParam(sourceRevision)) {
    return { ok: false, reason: 'unsafe_param' };
  }
  if (sceneCheckpoint != null) {
    if (typeof sceneCheckpoint !== 'string' || sceneCheckpoint.length > 32 || looksLikeUnsafeParam(sceneCheckpoint)) {
      return { ok: false, reason: 'invalid_scene_checkpoint' };
    }
  }

  /** @type {ResearchHandoff} */
  const handoff = {
    objectId,
    claimId,
    readerId,
    sourceRevision: sourceRevision.trim(),
  };
  if (sceneCheckpoint) handoff.sceneCheckpoint = sceneCheckpoint;

  return { ok: true, handoff };
}

/**
 * @param {string} value
 */
function looksLikeUnsafeParam(value) {
  if (/[<>`'"\\\n\r]/.test(value)) return true;
  if (/https?:\/\//i.test(value)) return true;
  if (value.includes('..') || value.includes('/') || value.includes('\\')) return true;
  return false;
}

/**
 * @param {ResearchHandoff} handoff
 * @param {string} [basePath]
 */
export function buildResearchConsoleUrl(handoff, basePath = RESEARCH_CONSOLE_PATH) {
  const validated = validateHandoff(handoff);
  if (!validated.ok) {
    throw new Error(`Cannot build research console URL: ${validated.reason}`);
  }
  const params = new URLSearchParams({
    objectId: validated.handoff.objectId,
    claimId: validated.handoff.claimId,
    readerId: validated.handoff.readerId,
    sourceRevision: validated.handoff.sourceRevision,
  });
  if (validated.handoff.sceneCheckpoint) {
    params.set('sceneCheckpoint', validated.handoff.sceneCheckpoint);
  }
  const path = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return `${path}?${params.toString()}`;
}

/**
 * Open the research console without making it a critical dependency of the world.
 * Falls back to same-tab navigation; world remains available via browser history / original tab.
 * @param {ResearchHandoff} handoff
 * @param {{ preferNewTab?: boolean }} [options]
 * @returns {{ opened: boolean, url: string, mode: 'new-tab' | 'same-tab' | 'failed', reason?: string }}
 */
export function openResearchConsole(handoff, options = {}) {
  const preferNewTab = options.preferNewTab !== false;
  let url;
  try {
    url = buildResearchConsoleUrl(handoff);
  } catch (error) {
    return { opened: false, url: '', mode: 'failed', reason: String(error?.message || error) };
  }

  if (typeof window === 'undefined') {
    return { opened: false, url, mode: 'failed', reason: 'no_window' };
  }

  if (preferNewTab) {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (win) return { opened: true, url, mode: 'new-tab' };
  }

  window.location.assign(url);
  return { opened: true, url, mode: 'same-tab' };
}
