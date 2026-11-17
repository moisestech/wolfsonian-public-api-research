import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PUBLIC_ANCHORS} from '../src/atlas-graph.mjs';
import {resolvePublicAccession,encounterFor,withPublicAnchorFallback,atlasHandoffFor} from '../src/object-lens-core.mjs';

test('six public anchor identities match exactly, never by prefix',()=>{
  assert.equal(PUBLIC_ANCHORS.length,6);
  for(const item of PUBLIC_ANCHORS)assert.equal(resolvePublicAccession(item.accession).status,'EXACT');
  assert.equal(resolvePublicAccession('XM1999.108').status,'NOT_VERIFIED');
  assert.equal(resolvePublicAccession('85.7.383a').status,'NOT_VERIFIED');
  assert.equal(encounterFor('DOES_NOT_EXIST'),null);
});
test('an artist-authored scene does not assert unproven history',()=>{
  const m=encounterFor('XM1999.108.8');
  assert.equal(m.date,'1927');
  assert.deepEqual(m.evidence.map(x=>x.field),['Title','Accession','Date']);
  assert.equal(new Set(m.readers.map(x=>x.script)).size,3);
  assert.ok(m.readers.every(x=>x.classification==='ARTIST_AUTHORED_INTERPRETATION'&&x.historicalRelationshipEstablished===false));
  assert.ok(m.readers.every(x=>x.citations.length===0));
  assert.match(m.readers.find(x=>x.id==='archivist').script,/cannot establish/);
});
test('Atlas fallback retains real records and never invents neighbors',()=>{
  const existing=[{accession:'XM1999.108.8',title:'verified research source',tags:[{family:'theme',value:'test'}]}];
  const merged=withPublicAnchorFallback(existing);
  assert.equal(merged.length,6);
  assert.equal(merged.find(x=>x.accession==='XM1999.108.8'),existing[0]);
  assert.deepEqual(merged.find(x=>x.accession==='XX1990.1484').tags,[]);
  assert.equal(merged.find(x=>x.accession==='XX1990.1484').source,'public-packet');
  assert.equal(existing.length,1);
  assert.equal(atlasHandoffFor('85.7.383a,b'),'../archive-society/?accession=85.7.383a%2Cb');
  assert.equal(atlasHandoffFor('unknown'),null);
});
test('mobile interface requires visitor confirmation, not automatic image recognition',async()=>{
  const html=await readFile(new URL('../demo/object-lens/index.html',import.meta.url),'utf8');
  const js=await readFile(new URL('../demo/object-lens/lens.mjs',import.meta.url),'utf8');
  assert.match(html,/id="confirm"/);
  assert.match(html,/id="encounter"/);
  assert.match(html,/id="evidence-list"/);
  assert.match(html,/recognition is not enabled/);
  assert.match(js,/getUserMedia/);
  assert.match(js,/localService/);
  assert.doesNotMatch(js,/fetch\(|navigator\.sendBeacon/);
});
