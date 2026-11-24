import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildRadioTvPublicBundle } from '../scripts/build-radio-tv-public-bundle.mjs';

test('public Radio × Television snapshot exposes precisely two approved packets and authored relation', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'radio-tv-research-'));
  try {
    const built = await buildRadioTvPublicBundle(dir);
    assert.equal(built.roomId, 'radio-and-television');
    assert.deepEqual(built.packetIds, ['WOLF-008', 'WOLF-002']);
    assert.deepEqual((await readdir(dir)).sort(), ['WOLF-002.json', 'WOLF-008.json', 'room.json']);
    for (const [id, accession] of [['WOLF-008','2012.6.1'],['WOLF-002','XX1990.1484']]) {
      const path = join(dir, id + '.json');
      const bytes = await readFile(path, 'utf8');
      const packet = JSON.parse(bytes);
      assert.deepEqual(Object.keys(packet), [
        'id', 'accessionNumber', 'title', 'date', 'creator', 'materials',
        'source_urls', 'retrieved_at', 'research_status', 'not_established_in_public_packet',
      ]);
      assert.equal(packet.id, id);
      assert.equal(packet.accessionNumber, accession);
      assert.equal(packet.research_status, 'public-record-only');
      assert.match(packet.source_urls[0], /^https:\/\/wolfsonian\.org\//);
      assert.doesNotMatch(bytes, /project-matches|matrix-objects|mx-2009-5-1|elevenlabs|cloudinary/i);
      assert.equal(Object.hasOwn(packet, 'representation'), false);
      assert.equal(Object.hasOwn(packet, 'source_text'), false);
    }
    const room = JSON.parse(await readFile(join(dir, 'room.json'), 'utf8'));
    assert.equal(room.relationshipType, 'curatorial_juxtaposition');
    assert.equal(room.historicalRelationshipEstablished, false);
    assert.equal(room.source.packet, 'WOLF-008');
    assert.equal(room.target.packet, 'WOLF-002');
    assert.match(room.limits, /no shared owner/i);
    assert.equal(Object.hasOwn(room, 'turns'), false);
    assert.equal(Object.hasOwn(room, 'sourceLinks'), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('Townhall links only the chosen authored room to the opt-in research console', async () => {
  const society = await readFile(new URL('../demo/archive-society/society.mjs', import.meta.url), 'utf8');
  assert.match(society, /state\.researchPath\.id==='radio-and-television'/);
  assert.match(society, /research-console\/\?roomId=radio-and-television/);
  assert.match(society, /investigate\.target='_blank'/);
  assert.match(society, /investigate\.rel='noopener noreferrer'/);
  const app = await readFile(new URL('../research-console/src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /request\.has\('roomId'\) \? <RadioTvApp \/>/);
  const console = await readFile(new URL('../research-console/src/RadioTvApp.tsx', import.meta.url), 'utf8');
  assert.match(console, /roomId !== 'radio-and-television'/);
  assert.match(console, /no live LLM/);
  assert.match(console, /ToolActivityTrace|RadioTvMessage/);
});
