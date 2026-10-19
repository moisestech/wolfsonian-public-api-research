export const APPROVED_OBJECT_IDS = ['WOLF-002'] as const;
export const APPROVED_CLAIM_IDS = ['futurist', 'worker'] as const;
export const APPROVED_READER_IDS = APPROVED_CLAIM_IDS;

export type ResearchHandoff = {
  objectId: string;
  claimId: string;
  readerId: string;
  sourceRevision: string;
  sceneCheckpoint?: string;
};

function looksLikeUnsafeParam(value: string): boolean {
  if (/[<>`'"\\\n\r]/.test(value)) return true;
  if (/https?:\/\//i.test(value)) return true;
  if (value.includes('..') || value.includes('/') || value.includes('\\')) return true;
  return false;
}

export function validateHandoff(
  input: URLSearchParams | Partial<ResearchHandoff>,
): { ok: true; handoff: ResearchHandoff } | { ok: false; reason: string } {
  const raw =
    input instanceof URLSearchParams ? Object.fromEntries(input.entries()) : { ...input };

  const objectId = raw.objectId;
  const claimId = raw.claimId;
  const readerId = raw.readerId || claimId;
  const sourceRevision = raw.sourceRevision;
  const sceneCheckpoint = raw.sceneCheckpoint;

  if (!objectId || !(APPROVED_OBJECT_IDS as readonly string[]).includes(objectId)) {
    return { ok: false, reason: 'invalid_object_id' };
  }
  if (!claimId || !(APPROVED_CLAIM_IDS as readonly string[]).includes(claimId)) {
    return { ok: false, reason: 'invalid_claim_id' };
  }
  if (!readerId || !(APPROVED_READER_IDS as readonly string[]).includes(readerId)) {
    return { ok: false, reason: 'invalid_reader_id' };
  }
  if (typeof sourceRevision !== 'string' || !sourceRevision.trim() || sourceRevision.length > 64) {
    return { ok: false, reason: 'invalid_source_revision' };
  }
  if (
    looksLikeUnsafeParam(objectId) ||
    looksLikeUnsafeParam(claimId) ||
    looksLikeUnsafeParam(sourceRevision)
  ) {
    return { ok: false, reason: 'unsafe_param' };
  }
  if (sceneCheckpoint != null) {
    if (
      typeof sceneCheckpoint !== 'string' ||
      sceneCheckpoint.length > 32 ||
      looksLikeUnsafeParam(sceneCheckpoint)
    ) {
      return { ok: false, reason: 'invalid_scene_checkpoint' };
    }
  }

  const handoff: ResearchHandoff = {
    objectId,
    claimId,
    readerId,
    sourceRevision: sourceRevision.trim(),
  };
  if (sceneCheckpoint) handoff.sceneCheckpoint = sceneCheckpoint;
  return { ok: true, handoff };
}

export function parseHandoffFromLocation(search = window.location.search) {
  return validateHandoff(new URLSearchParams(search));
}
