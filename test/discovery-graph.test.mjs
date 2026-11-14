import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, parseMatrixCsv, buildDiscoveryIndex, recommendNeighbors, PERSONAS } from '../src/discovery-graph.mjs';

const csv = [
  '"Object at Scale matrix","instructions are not objects"',
  '',
  'Accession Number,Object Display Title (English Translated Title),Primary Name Artist/Creator,Date Created,Object Type,Image Filename,Interpretive Text,Geography,Visual Strategy/Style,Thematic Category 1,Thematic Category 2,Thematic Category 3,Symbols/Motifs 1,Symbols/Motifs 2,Related Object 1,Related Category 1,Related Object 2,Related Category 2,Related Object 3,Related Category 3',
  'Germany,Illustration,,,,,,,,,,,,,,,,,,',
  '"XX1990.3083","Always Faster, German State Railroad",A Designer,1930,Poster,example.tif,"Railways, speed, and progress.",Germany,Montage,Travel / Transportation,Advertising,Technology,Speed,Trains,,,,,,',
  '"2014.6.32","Paris-Liège in 4 Hours",Another Designer,1935,Poster,example2.tif,"Publicity\nfor a route",France,Montage,Travel / Transportation,Advertising,Technology,Speed,Trains,,,,,,',
  '"87.4.5","A Damaged Hand Lamp Is a Deadly Handshake",Another Maker,1936,Poster,,Safety,Finland,Symbolism,Domestic life,Electricity,Safety / Health,Hands,Electric bolts,,,,,,'
].join('\n');

test('RFC4180 reader preserves escaped quotes and embedded newlines',()=>{
  assert.deepEqual(parseCsv('a,b\n"hello, ""reader""","line 1\nline 2"'),[
    ['a','b'],['hello, "reader"','line 1\nline 2']
  ]);
  assert.throws(()=>parseCsv('"unterminated'),/unterminated/);
});

test('Object at Scale CSV parser skips instruction and country-heading rows',()=>{
  const parsed=parseMatrixCsv(csv);
  assert.equal(parsed.records.length,3);
  assert.equal(parsed.metadata.headerRow,3);
  assert.deepEqual(parsed.records.map(r=>r.accession),['XX1990.3083','2014.6.32','87.4.5']);
  assert.equal(parsed.records[1].interpretiveText,'Publicity for a route');
  assert.equal(parsed.records[0].imageFilename,'example.tif');
  assert.deepEqual(parsed.records[0].tags.filter(t=>t.family==='theme').map(t=>t.value),[
    'Travel / Transportation','Advertising','Technology'
  ]);
  assert.deepEqual(parsed.records[0].tags.filter(t=>t.family==='motif').map(t=>t.value),['Speed','Trains']);
  assert.ok(!parsed.records[0].tags.some(t=>t.family==='related'));
});

test('two posters sharing staff tags get an explainable candidate, not a historical claim',()=>{
  const records=parseMatrixCsv(csv).records;
  const index=buildDiscoveryIndex(records);
  const neighbors=recommendNeighbors(index,'XX1990.3083','tourist');
  assert.equal(neighbors.length,1);
  assert.equal(neighbors[0].record.accession,'2014.6.32');
  assert.equal(neighbors[0].provenance,'shared_staff_metadata');
  assert.equal(neighbors[0].historicalRelationshipEstablished,false);
  assert.deepEqual(neighbors[0].reasons.filter(r=>r.family==='motif').map(r=>r.value).sort(),['Speed','Trains']);
  assert.ok(neighbors[0].reasons.some(r=>r.sourceColumns.includes('Thematic Category 3')));
  assert.equal(recommendNeighbors(index,'not-an-accession').length,0);
});

const t=(family,value)=>({
  id:family+':'+value.toLowerCase(),
  family,value,sourceColumns:[family==='theme'?'Thematic Category 1':'Symbols/Motifs 1']
});
const sample=[
  {accession:'seed',title:'Center',tags:[t('theme','Labor'),t('motif','Workers'),t('theme','Technology'),t('motif','Speed')]},
  {accession:'labor',title:'Labor',tags:[t('theme','Labor'),t('motif','Workers')]},
  {accession:'speed',title:'Speed',tags:[t('theme','Technology'),t('motif','Speed')]}
];
test('personas re-rank the same provenance without changing the underlying objects',()=>{
  const index=buildDiscoveryIndex(sample);
  assert.equal(recommendNeighbors(index,'seed','worker',2)[0].record.accession,'labor');
  assert.equal(recommendNeighbors(index,'seed','futurist',2)[0].record.accession,'speed');
  assert.equal(index.size,3);
  assert.ok(PERSONAS.find(p=>p.id==='family'));
  assert.ok(PERSONAS.find(p=>p.id==='tourist'));
  assert.ok(PERSONAS.find(p=>p.id==='connoisseur'));
});

test('duplicate source accession numbers are rejected rather than silently overwritten',()=>{
  assert.throws(()=>buildDiscoveryIndex([sample[0],sample[0]]),/unique/);
});

test('the importer does not assume curated links exist or silently turn them into tags',()=>{
  const parsed=parseMatrixCsv(csv);
  assert.ok(parsed.records.every(record=>record.tags.every(tag=>['theme','motif','style','geography'].includes(tag.family))));
  assert.throws(()=>parseMatrixCsv('one,two\na,b'),/headers/);
});
