/** Coverage counts pairs, not directions, lenses or synthetic template variants. */
import { accessionKey, sceneVoiceBrief } from './conversation-voices.mjs';

export const pairKey = (a, b) => [accessionKey(a), accessionKey(b)].sort().join('::');
const recordsByKey = records => new Map(records.filter(r => accessionKey(r.accession)).map(r => [accessionKey(r.accession), r]));
export function authoredPairs(scenes = [], paths = []) {
  return [
    ...scenes.map(scene => ({ id: scene.id, a: scene.pair[0], b: scene.pair[1], relationship: 'shared_staff_metadata', status: scene.status, requires: scene.requires })),
    ...paths.map(path => ({ id: path.id, a: path.source.accession, b: path.target.accession, relationship: 'curatorial_juxtaposition', status: path.status })),
  ];
}
export function auditConversationCoverage(records, pairs = []) {
  const objects = recordsByKey(records), unique = new Map(), outOfScope = [], unmetSourceGates = [], registered = new Set();
  for (const pair of pairs) {
    const a = accessionKey(pair.a), b = accessionKey(pair.b);
    if (!a || !b || a === b) continue;
    if (!objects.has(a) || !objects.has(b)) { outOfScope.push(pair.id); continue; }
    registered.add(pairKey(a, b));
    if (pair.requires && ![objects.get(a), objects.get(b)].every(record => (record.tags || []).some(tag => tag.family === pair.requires.family && tag.value === pair.requires.value))) {
      unmetSourceGates.push(pair.id); continue;
    }
    const key = pairKey(a, b), previous = unique.get(key);
    // Multiple sources/scripts for a pair count once; retain evidence of actual approval.
    unique.set(key, { ...pair, key, approved: previous?.approved || pair.status === 'APPROVED_FOR_PUBLICATION' });
  }
  const degree = new Map([...objects.keys()].map(id => [id, 0]));
  for (const pair of unique.values()) for (const id of [pair.a, pair.b]) degree.set(accessionKey(id), degree.get(accessionKey(id)) + 1);
  return {
    objects: objects.size, registeredPairs: registered.size, distinctAuthoredPairs: unique.size,
    approvedPairs: [...unique.values()].filter(pair => pair.approved).length,
    targetPairs: objects.size, targetMet: objects.size > 0 && unique.size >= objects.size,
    objectsWithScenes: [...degree.values()].filter(n => n > 0).length,
    objectsWithTwoNeighbors: [...degree.values()].filter(n => n >= 2).length,
    uncovered: [...degree].filter(([, n]) => n === 0).map(([id]) => objects.get(id).accession),
    oneNeighbor: [...degree].filter(([, n]) => n === 1).map(([id]) => objects.get(id).accession),
    outOfScope, unmetSourceGates, degree: Object.fromEntries(degree),
  };
}

export function candidateMetadataPairs(records) {
  const objects = [...recordsByKey(records).values()], tags = record => (record.tags || []).filter(tag =>
    ['theme', 'motif'].includes(tag.family) && String(tag.value || '').trim() && !/^(unlabeled|unknown|none)$/i.test(tag.value.trim()));
  const frequency = new Map();
  for (const record of objects) for (const tag of tags(record)) {
    const key = tag.family + ':' + tag.value.trim().toLowerCase();
    frequency.set(key, (frequency.get(key) || 0) + 1);
  }
  const pairs = [];
  for (let i = 0; i < objects.length; i++) for (let j = i + 1; j < objects.length; j++) {
    const a = objects[i], b = objects[j], other = tags(b);
    const reasons = tags(a).filter(tag => other.some(t => t.family === tag.family && t.value.trim().toLowerCase() === tag.value.trim().toLowerCase()));
    if (!reasons.length) continue;
    const evidence = [...new Map(reasons.map(tag => [tag.family + ':' + tag.value.trim().toLowerCase(), { family: tag.family, value: tag.value }])).values()];
    const score = evidence.reduce((n, tag) => n + (tag.family === 'motif' ? 2 : 1) * (1 + Math.log((objects.length + 1) / (frequency.get(tag.family + ':' + tag.value.trim().toLowerCase()) + 1))), 0);
    pairs.push({ id: pairKey(a.accession, b.accession), a: a.accession, b: b.accession, reasons: evidence, score: Number(score.toFixed(3)), relationship: 'shared_staff_metadata', status: 'CANDIDATE_NOT_A_CONVERSATION' });
  }
  return pairs.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function planConversationCoverage(records, existingPairs = [], { minimumNeighbors = 2, batchSize = 4 } = {}) {
  if (!Number.isInteger(minimumNeighbors) || minimumNeighbors < 1 || !Number.isInteger(batchSize) || batchSize < 1) throw new Error('Positive integer coverage and batch sizes are required.');
  const initial = auditConversationCoverage(records, existingPairs), degree = { ...initial.degree };
  const byKey = recordsByKey(records), used = new Set(existingPairs.map(pair => pairKey(pair.a, pair.b)));
  const candidates = candidateMetadataPairs(records).filter(pair => !used.has(pair.id));
  const selected = [];
  while (candidates.length) {
    let index = -1, best = -Infinity;
    for (let i = 0; i < candidates.length; i++) {
      const pair = candidates[i], da = degree[accessionKey(pair.a)], db = degree[accessionKey(pair.b)];
      const need = Math.max(0, minimumNeighbors - da) + Math.max(0, minimumNeighbors - db);
      if (!need && initial.distinctAuthoredPairs + selected.length >= initial.targetPairs) continue;
      const score = need * 1000 + (da === 0 || db === 0 ? 500 : 0) + pair.score - Math.max(da, db) * 0.2;
      if (score > best) { best = score; index = i; }
    }
    if (index < 0) break;
    const [pair] = candidates.splice(index, 1);
    degree[accessionKey(pair.a)]++; degree[accessionKey(pair.b)]++;
    selected.push({ ...pair, batch: Math.floor(selected.length / batchSize) + 1, voiceBrief: sceneVoiceBrief(byKey.get(accessionKey(pair.a)), byKey.get(accessionKey(pair.b))),
      review: { sourceCheck: 'PENDING', objectInspection: 'PENDING', dialogueEdit: 'PENDING', readAloud: 'PENDING', approval: 'PENDING' } });
  }
  return { initial, proposedPairs: selected, projected: auditConversationCoverage(records, [...existingPairs, ...selected]),
    note: 'Projection only. Candidate pairs and inferred voice briefs do not count as authored, approved or published scenes. Decline weak pairs; an unmet target is a research need, not permission to fabricate.' };
}
