/**
 * Radio × Television: real, deterministic, read-only public-source operations.
 * No model, institution-only API, staff dataset, photo, or autonomous publication.
 * Consumers supply the canonical public packets and the curated relationship.
 */
export const RADIO_TV_ROOM_ID = 'radio-and-television';
export const RADIO_TV_PACKETS = Object.freeze([
  { packetId: 'WOLF-008', accession: '2012.6.1' },
  { packetId: 'WOLF-002', accession: 'XX1990.1484' },
]);
export const RADIO_TV_INTENTS = Object.freeze(['compare', 'inspect', 'limits']);

const PUBLIC_FIELDS = Object.freeze(['title', 'accessionNumber', 'date', 'creator', 'materials']);
const ACCESSION_BY_PACKET = new Map(RADIO_TV_PACKETS.map(item => [item.packetId, item.accession]));
const error = code => Object.assign(new Error(code), { code });

function assertRoom(room) {
  if (room?.id !== RADIO_TV_ROOM_ID ||
      room?.relationshipType !== 'curatorial_juxtaposition' ||
      room?.historicalRelationshipEstablished !== false ||
      room?.source?.accession !== RADIO_TV_PACKETS[0].accession ||
      room?.target?.accession !== RADIO_TV_PACKETS[1].accession ||
      room?.source?.packet !== RADIO_TV_PACKETS[0].packetId ||
      room?.target?.packet !== RADIO_TV_PACKETS[1].packetId ||
      typeof room.proposal !== 'string' ||
      typeof room.limits !== 'string') {
    throw error('ROOM_NOT_APPROVED');
  }
}

function publicUrl(packet) {
  const value = packet?.source_urls?.[0];
  if (typeof value !== 'string') throw error('SOURCE_URL_MISSING');
  let url;
  try { url = new URL(value); } catch { throw error('SOURCE_URL_INVALID'); }
  if (url.protocol !== 'https:' || url.hostname !== 'wolfsonian.org' ||
      url.username || url.password) throw error('SOURCE_URL_NOT_APPROVED');
  return url.toString();
}

function assertPacket(packet, expected) {
  if (!packet || packet.id !== expected.packetId ||
      packet.accessionNumber !== expected.accession ||
      packet.research_status !== 'public-record-only' ||
      typeof packet.retrieved_at !== 'string' ||
      !/^\d{4}-\d\d-\d\d$/.test(packet.retrieved_at)) throw error('PUBLIC_PACKET_INVALID');
  for (const field of PUBLIC_FIELDS) {
    const value = packet[field];
    if (!(typeof value === 'string' && value.trim()) &&
        !(Array.isArray(value) && value.length && value.every(item => typeof item === 'string' && item.trim()))) {
      throw error('PUBLIC_FIELD_MISSING');
    }
  }
  if (!Array.isArray(packet.not_established_in_public_packet) ||
      !packet.not_established_in_public_packet.every(item => typeof item === 'string')) {
    throw error('PUBLIC_LIMITS_INVALID');
  }
  publicUrl(packet);
}

async function contentHash(packet) {
  if (!globalThis.crypto?.subtle) throw error('HASH_UNAVAILABLE');
  const encoded = new TextEncoder().encode(JSON.stringify(packet));
  const bytes = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', encoded));
  return Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('');
}

async function normalizePublicPacket(packet, expected) {
  assertPacket(packet, expected);
  const sourceUrl = publicUrl(packet);
  const packetSha256 = await contentHash(packet);
  const fields = PUBLIC_FIELDS.map(field => ({
    evidenceId: expected.packetId + ':' + field,
    packetId: expected.packetId,
    accession: expected.accession,
    field,
    value: packet[field],
    sourceUrl,
    retrievedAt: packet.retrieved_at,
    packetSha256,
    classification: 'public',
  }));
  return {
    packetId: expected.packetId,
    accession: expected.accession,
    title: packet.title,
    date: packet.date,
    creator: packet.creator,
    materials: packet.materials,
    sourceUrl,
    retrievedAt: packet.retrieved_at,
    packetSha256,
    notEstablished: packet.not_established_in_public_packet.slice(),
    fields,
  };
}

const safeErrorCode = cause => typeof cause?.code === 'string' && /^[A-Z_]{3,60}$/.test(cause.code)
  ? cause.code : 'TOOL_EXECUTION_FAILED';

/**
 * @param {object} input
 * @param {'compare'|'inspect'|'limits'} input.intent
 * @param {object} input.room Canonical CURATORIAL_PATHS room, not user-authored input.
 * @param {(packetId:string)=>Promise<object>} input.loadPublicPacket Approved local packet reader.
 * @param {string[]} [input.claimedCitationIds] Optional proposed refs for gate testing.
 * @param {(event:object)=>void} [input.onEvent] Observe actual operation transitions.
 */
export async function runRadioTvResearch({
  intent, room, loadPublicPacket, claimedCitationIds = [], onEvent,
}) {
  const runId = globalThis.crypto?.randomUUID?.() || 'local-' + Date.now();
  const events = [];
  const started = () => globalThis.performance?.now?.() ?? Date.now();
  const emit = (kind, status, extra = {}) => {
    const event = {
      schemaVersion: 'wolfsonian.operation.v1', runId,
      eventId: runId + ':' + (events.length + 1),
      sequence: events.length + 1, occurredAt: new Date().toISOString(),
      kind, status, mode: 'deterministic_public_only', ...extra,
    };
    events.push(event);
    if (onEvent) onEvent(event);
  };
  const tool = async (toolName, resourceId, operation) => {
    const t0 = started();
    emit('tool.started', 'started', { toolName, resourceId });
    try {
      const result = await operation();
      emit('tool.completed', 'completed', {
        toolName, resourceId, durationMs: Math.max(0, started() - t0),
      });
      return result;
    } catch (cause) {
      emit('tool.failed', 'failed', {
        toolName, resourceId, errorCode: safeErrorCode(cause),
        durationMs: Math.max(0, started() - t0),
      });
      throw cause;
    }
  };

  emit('run.started', 'started', { roomId: RADIO_TV_ROOM_ID, intent });
  try {
    assertRoom(room);
    if (!RADIO_TV_INTENTS.includes(intent)) throw error('UNSUPPORTED_INTENT');
    if (typeof loadPublicPacket !== 'function') throw error('PACKET_LOADER_REQUIRED');
    if (!Array.isArray(claimedCitationIds) ||
        claimedCitationIds.some(id => typeof id !== 'string' || id.length > 128)) {
      throw error('CITATION_INPUT_INVALID');
    }
    const records = [];
    for (const expected of RADIO_TV_PACKETS) {
      records.push(await tool('inspect_public_record', expected.packetId,
        async () => normalizePublicPacket(await loadPublicPacket(expected.packetId), expected)));
    }
    const comparison = await tool('compare_public_records', RADIO_TV_ROOM_ID, async () => ({
      relation: room.relationshipType,
      proposal: room.proposal,
      limitations: room.limits,
      historicalRelationshipEstablished: false,
      participants: records.map(record => record.accession),
    }));
    const evidence = records.flatMap(record => record.fields);
    await tool('validate_citation_ids', RADIO_TV_ROOM_ID, async () => {
      const allow = new Set(evidence.map(ref => ref.evidenceId));
      if (claimedCitationIds.some(id => !allow.has(id))) throw error('UNKNOWN_EVIDENCE_REF');
      return true; // Reference resolution only; never a semantic entailment check.
    });
    const [tv, radio] = records;
    const message = intent === 'inspect'
      ? 'Public packets identify ' + tv.title + ' (' + tv.date + ') and ' +
        radio.title + ' (' + radio.date + '). Their catalogued fields do not prove who watched or listened.'
      : intent === 'limits'
        ? 'NOT ESTABLISHED by these packets: ' +
          records.map(record => record.accession + ': ' + record.notEstablished.join(', ')).join('; ') +
          '. Pair limit: ' + comparison.limitations
        : 'Artist-authored juxtaposition: ' + comparison.proposal +
          ' Historical contact is NOT ESTABLISHED. ' + comparison.limitations;
    emit('run.completed', 'completed', { evidenceIds: evidence.map(ref => ref.evidenceId) });
    return {
      status: 'completed', runId, roomId: RADIO_TV_ROOM_ID, intent,
      answer: message, records, comparison, evidence,
      citationCheck: 'reference_ids_resolved_semantic_support_not_assessed',
      events,
    };
  } catch (cause) {
    const errorCode = safeErrorCode(cause);
    const blocked = ['ROOM_NOT_APPROVED', 'UNSUPPORTED_INTENT', 'UNKNOWN_EVIDENCE_REF',
      'CITATION_INPUT_INVALID', 'SOURCE_URL_NOT_APPROVED', 'SOURCE_URL_INVALID',
      'SOURCE_URL_MISSING', 'PUBLIC_PACKET_INVALID', 'PUBLIC_FIELD_MISSING',
      'PUBLIC_LIMITS_INVALID'].includes(errorCode);
    emit(blocked ? 'run.blocked' : 'run.failed', blocked ? 'blocked' : 'failed', { errorCode });
    return { status: blocked ? 'blocked' : 'failed', runId, roomId: RADIO_TV_ROOM_ID,
      intent, errorCode, events };
  }
}
