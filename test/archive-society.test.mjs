import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseMatrixCsv } from '../src/discovery-graph.mjs';
import { inventedRecords,societyView,conversationFor,photoKeys,imageKeys } from '../src/archive-society.mjs';
import { reconcileLookup,recordsFromLookup } from '../src/archive-evidence.mjs';

test('invented atlas has bounded, deterministic object/conversation neighborhoods',()=>{
  const records=inventedRecords(),view=societyView(records,'FICTION-01','worker');
  assert.ok(view.nodes.length<=7);assert.ok(view.edges.length>0&&view.edges.length<=6);
  assert.deepEqual(view,societyView(records,'FICTION-01','worker'));
  assert.ok(view.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)));
  assert.ok(view.edges.every(e=>e.historicalRelationshipEstablished===false&&e.reasons[0].sourceColumns.length));
});
test('CSV categories remain exact and private data is not needed in the repo',async()=>{
  const input=await readFile(new URL('../examples/archive-society.synthetic.csv',import.meta.url),'utf8');
  const {records}=parseMatrixCsv(input);assert.equal(records.length,4);
  const view=societyView(records,records[0].accession,'family');
  const c=conversationFor(records[0],records.find(r=>r.accession===view.edges[0].target),view.edges[0],'worker');
  assert.equal(c.turns.length,3);assert.equal(c.mode,'scripted_interpretation');
  assert.equal(c.historicalRelationshipEstablished,false);assert.ok(c.evidence[0].sourceColumns[0]);
});
test('filters and isolated objects do not manufacture edges',()=>{
  const records=inventedRecords();
  assert.equal(records.length,100);
  assert.equal(records[0].title,'Imagined domestic radio');
  assert.equal(records[11].accession,'FICTION-12');
  assert.equal(records[11].title,'Imagined collecting guide');
  const themes=new Set(records.slice(0,12).flatMap(record=>record.tags.filter(tag=>tag.family==='theme').map(tag=>tag.value)));
  const motifs=new Set(records.slice(0,12).flatMap(record=>record.tags.filter(tag=>tag.family==='motif').map(tag=>tag.value)));
  assert.ok(records.every(record=>record.source==='invented'&&record.title.startsWith('Imagined ')));
  assert.ok(records.every(record=>record.tags.filter(tag=>tag.family==='theme').every(tag=>themes.has(tag.value))));
  assert.ok(records.every(record=>record.tags.filter(tag=>tag.family==='motif').every(tag=>motifs.has(tag.value))));
  assert.equal(societyView(records,'FICTION-01','family',{theme:'Does not exist'}).edges.length,0);
  assert.deepEqual(societyView(records,'missing').nodes,[]);
  const focused=societyView(records,'FICTION-01','family');
  const overview=societyView(records,'FICTION-01','family',{atlas:true});
  assert.ok(focused.nodes.length<=7);
  assert.equal(overview.nodes.length,100);
  assert.ok(Math.max(...overview.nodes.map(node=>node.x))>2000);
  assert.equal(overview.landmarks.personas.length,5);
  assert.ok(overview.landmarks.categories.length>=6);
  assert.deepEqual(focused.landmarks,{personas:[],categories:[]});
});
test('component punctuation is preserved and comma accession is never split',()=>{
  const payload=[{'Accession Number':'85.7.383a,b',Title:'Test only'}];
  assert.equal(reconcileLookup(payload,'85.7.383a,b').status,'EXACT_PRIMARY_ACCESSION');
  assert.equal(reconcileLookup(payload,'85.7.383a').status,'NOT_IN_BOUNDED_RESPONSE');
  assert.equal(reconcileLookup(payload,'85.7.383a,B').status,'NOT_IN_BOUNDED_RESPONSE');
});
test('duplicate and conflicting primary identities are ambiguous',()=>{
  assert.equal(reconcileLookup([{'Accession Number':'TEST2026.1'},{'Accession Number':'TEST2026.1'}],'TEST2026.1').status,'AMBIGUOUS');
  assert.equal(reconcileLookup([{'Accession Number':'TEST2026.1',accession_number:'DIFFERENT2026.1'}],'TEST2026.1').status,'AMBIGUOUS');
});
test('additional accessions are exact, with explicit field pointers',()=>{
  const s=reconcileLookup({records:[{'Accession Number':'MAIN2026.1','Additional Accession Numbers':['TEST2026.1'],Date:null}]},'TEST2026.1','TEST_TIME');
  assert.equal(s.status,'EXACT_ADDITIONAL_ACCESSION');assert.equal(s.matches[0].identityPointer,'/records/0/Additional Accession Numbers');
  assert.equal(s.matches[0].fields.date.status,'NULL');assert.equal(s.boxContext,'NOT_ESTABLISHED_BY_THIS_ADAPTER');
});
test('unknown wrappers and large responses fail explicitly',()=>{
  assert.throws(()=>recordsFromLookup({records:[],items:[]}),/ambiguous/);
  assert.throws(()=>recordsFromLookup(Array(251).fill({})),/250/);
});
test('catalog date enters dialogue only after a unique primary match',()=>{
  const records=inventedRecords(),view=societyView(records,records[0].accession),edge=view.edges[0],target=records.find(r=>r.accession===edge.target);
  const snapshot=reconcileLookup([{'Accession Number':records[0].accession,Date:'TEST DATE'}],records[0].accession,'TEST_TIME');
  const c=conversationFor(records[0],target,edge,'family',{source:snapshot});
  assert.equal(c.resourceLayer,'catalog_field_quotes');assert.match(c.turns[0].text,/TEST DATE/);assert.equal(c.turns[0].citations[0].pointer,'/0/Date');
  assert.equal(conversationFor(records[0],target,edge,'family',{source:{...snapshot,status:'AMBIGUOUS'}}).resourceLayer,'no_matched_catalog_field');
});
test('local photograph matching preserves accession suffixes and filenames',()=>{
  assert.ok(photoKeys({accession:'85.7.383a,b',imageFilename:'folder/Exact Photo.JPG'}).includes('exact photo.jpg'));
  assert.ok(imageKeys('85.7.383a,b.png').includes('85.7.383a,b'));
});
