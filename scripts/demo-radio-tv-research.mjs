#!/usr/bin/env node
/**
 * Local demonstration of real source-loading and citation-check events.
 * Deterministic read-only research, NOT a live LLM or historic-object voice.
 *
 * node scripts/demo-radio-tv-research.mjs compare
 * node scripts/demo-radio-tv-research.mjs limits --bad-citation
 */
import { readFile } from 'node:fs/promises';
import { CURATORIAL_PATHS } from '../src/curatorial-relationships.mjs';
import { RADIO_TV_ROOM_ID, runRadioTvResearch } from '../src/radio-tv-research-tools.mjs';

const args = process.argv.slice(2);
const intent = args.find(arg => !arg.startsWith('--')) || 'compare';
const room = CURATORIAL_PATHS.find(path => path.id === RADIO_TV_ROOM_ID);
const loadPublicPacket = async packetId => {
  if (!['WOLF-008', 'WOLF-002'].includes(packetId)) throw new Error('Unknown packet');
  const path = new URL('../data/public/objects/' + packetId + '.json', import.meta.url);
  return JSON.parse(await readFile(path, 'utf8'));
};
const result = await runRadioTvResearch({
  room, intent, loadPublicPacket,
  claimedCitationIds: args.includes('--bad-citation') ? ['WOLF-999:title'] : [],
  onEvent: event => process.stdout.write(JSON.stringify(event) + '\n'),
});
process.stdout.write(JSON.stringify({
  outcome: result.status,
  roomId: result.roomId,
  mode: 'deterministic_public_only_no_llm',
  answer: result.answer || null,
  errorCode: result.errorCode || null,
  sources: result.records?.map(record => ({
    packetId: record.packetId, accession: record.accession,
    sourceUrl: record.sourceUrl, sha256: record.packetSha256,
  })) || [],
  citationCheck: result.citationCheck || null,
}, null, 2) + '\n');
if (result.status !== 'completed') process.exitCode = 2;
