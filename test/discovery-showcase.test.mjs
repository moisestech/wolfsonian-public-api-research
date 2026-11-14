import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS, portraitSvg, portraitUrl } from '../src/discovery-personas.mjs';
import { makeDialogue, replyToQuestion, VOICE_DISCLOSURE } from '../src/discovery-dialogue.mjs';
import { buildDiscoveryIndex, recommendNeighbors, PERSONAS } from '../src/discovery-graph.mjs';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
test('the presentation contains five relatable and six artist-authored personas',()=>{
  assert.equal(CARDS.filter(p=>p.group==='everyday').length,5);
  assert.equal(CARDS.filter(p=>p.group==='archive').length,6);
  for(const id of ['family','tourist','novice','connoisseur','worker','archivist','futurist','mourner','propagandist','counterfeit','museum']){
    const p=CARDS.find(p=>p.id===id);
    assert.ok(p, 'missing '+id);
    assert.ok(PERSONAS.some(x=>x.id===id));
    assert.match(p.prompt,/ONLY USE:/);
    assert.match(p.prompt,/NEVER:/);
    assert.match(p.prompt,/shared category/i);
    assert.match(p.prompt,/not a historical person/i);
    assert.match(portraitSvg(p),/<svg/);
    assert.match(portraitUrl(p),/^data:image\/svg\+xml/);
  }
});
const tags=[{id:'theme:technology',value:'Technology',family:'theme',sourceColumns:['Thematic Category 1']},
            {id:'motif:speed',value:'Speed',family:'motif',sourceColumns:['Symbols/Motifs 1']}];
const records=[{accession:'X.001',title:'Invented railway advertisement',tags},
               {accession:'X.002',title:'Invented air exhibition',tags}];
test('an object dialogue is scripted and explicitly limits its claims',()=>{
 const index=buildDiscoveryIndex(records);
 const connection=recommendNeighbors(index,'X.001','futurist')[0];
 const persona=PERSONAS.find(x=>x.id==='futurist');
 const lines=makeDialogue(records[0],records[1],connection,persona);
 assert.equal(lines.length,3);
 assert.match(lines[0].text,/not speaking as an actual historical witness/);
 assert.match(lines[1].text,/not evidence/);
 assert.match(lines[2].text,/more sources or a human expert/);
 assert.match(VOICE_DISCLOSURE,/Not ElevenLabs/);
});
test('object questions do not claim box numbers or undocumented biographies',()=>{
 const persona=PERSONAS.find(x=>x.id==='archivist');
 assert.match(replyToQuestion('Which box contains me?',records[0],persona),/cannot be inferred/i);
 assert.match(replyToQuestion('who repaired it?',records[0],persona),/do not on their own establish/i);
 assert.match(replyToQuestion('Why connected?',records[0],persona),/not a demonstrated historical relationship/i);
});
test('presentational source code keeps all collection image imports local',async()=>{
 const html=await readFile(join(root,'demo/discovery-lab/index.html'),'utf8');
 const app=await readFile(join(root,'demo/discovery-lab/showcase.mjs'),'utf8');
 assert.match(html,/id="persona-list"/);
 assert.match(html,/id="prompt-modal"/);
 assert.match(html,/id="network"/);
 assert.match(html,/id="connection-panel"/);
 assert.match(html,/id="image-import"/);
 assert.match(app,/parseMatrixCsv\(await file.text\(\)\)/);
 assert.match(app,/URL.createObjectURL/);
 assert.match(app,/makeDialogue\(/);
 assert.ok(!app.includes('api.elevenlabs.io'), 'no ElevenLabs API call/key in the browser');
 assert.ok(!app.includes('lakehouse.wolfsonian.org'), 'do not claim an integrated Lakehouse API');
 assert.ok(!app.includes('fetch('), 'no network reads of the locally imported museum CSV');
});
