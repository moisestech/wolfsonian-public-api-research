import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {INQUIRY_STAGES,stageForQuestion,objectInquiryDialogue,ORIGINAL_QUESTION_COUNT} from '../src/object-inquiry.mjs';
import {buildStorageTopology,inspectStorageNode} from '../src/storage-topology.mjs';

test('Luna handout adaptation covers all twenty numbered questions exactly once',()=>{
  assert.equal(ORIGINAL_QUESTION_COUNT,20);
  const numbers=INQUIRY_STAGES.flatMap(s=>s.numbers);
  assert.deepEqual([...numbers].sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i+1));
  assert.equal(stageForQuestion(10).id,'provenance');
  assert.equal(stageForQuestion(17).id,'systems');
  assert.equal(stageForQuestion(22),null);
});
test('nine-turn conversation has authentic back-and-forth but no made-up location',()=>{
  const result=objectInquiryDialogue();
  assert.ok(result.turns.length>3);
  assert.equal(result.turns.length,9);
  assert.deepEqual(result.turns.slice(0,3).map(x=>x.speaker),['Visitor','Sparton radio','Visitor']);
  assert.ok(result.turns.some(x=>x.phase==='systems'));
  assert.ok(result.turns.some(x=>x.type==='source_limit'));
  assert.match(result.turns.map(x=>x.text).join(' '),/no approved record connecting/);
  assert.ok(!result.turns.some(x=>/DEMO-BOX-0[1-6]/.test(x.text)));
});
test('real public catalog identities are never given invented box, floor or bay',()=>{
  const scene=buildStorageTopology();
  assert.equal(scene.statistics.publicIdentities,4);
  assert.equal(scene.statistics.verifiedPlacements,0);
  assert.equal(scene.statistics.fictionalContainers,6);
  assert.ok(scene.identities.every(x=>x.containerId===null&&x.level===null&&x.bay===null));
  assert.ok(scene.containers.every(x=>x.id.startsWith('DEMO-')&&x.demoAccession.startsWith('FICTION-')));
  assert.ok(scene.links.every(x=>x.kind==='fictional_example'&&x.historical===false));
  assert.match(scene.sceneStatus,/NOT A DIGITAL TWIN/);
});
test('non-approved real placements, bogus source references and synthetic target boxes fail closed',()=>{
  const base={publicationApproved:true,coordinatesVerified:true,sourceRef:'STAFF-APPROVED-EXAMPLE',accession:'XX1990.1484',containerId:'STORAGE-123',level:'DEMO-L1',bay:'R2'};
  for(const bad of [
    {...base,publicationApproved:false},
    {...base,coordinatesVerified:false},
    {...base,sourceRef:''},
    {...base,accession:'UNKNOWN-ACCESSION'},
    {...base,containerId:'DEMO-BOX-01'}
  ]) assert.throws(()=>buildStorageTopology({approvedPlacements:[bad]}));
  assert.equal(buildStorageTopology({approvedPlacements:[base]}).statistics.verifiedPlacements,1);
  assert.throws(()=>buildStorageTopology({approvedPlacements:[base,base]}),/Conflicting/);
});
test('inspector visibly distinguishes fictional container and unknown real identity',()=>{
  const scene=buildStorageTopology();
  assert.match(inspectStorageNode(scene,'DEMO-BOX-01').description,/Not an actual Annex box/);
  assert.match(inspectStorageNode(scene,'XX1990.1484').description,/NOT ESTABLISHED OR NOT CLEARED/);
  assert.equal(inspectStorageNode(scene,'NOT-REAL'),null);
});
test('storage study is wired for safe static output and read-only local serving',async()=>{
  const html=await readFile(new URL('../demo/storage-volume/index.html',import.meta.url),'utf8');
  const js=await readFile(new URL('../demo/storage-volume/storage.mjs',import.meta.url),'utf8');
  const publicBuild=await readFile(new URL('../scripts/assemble-public-site.mjs',import.meta.url),'utf8');
  const localServer=await readFile(new URL('../scripts/serve-archive-society.mjs',import.meta.url),'utf8');
  assert.match(html,/SCHEMATIC · NOT AN ANNEX FLOOR PLAN/);
  assert.match(html,/noindex,nofollow/);
  assert.match(html,/node_modules\/three\/build\/three.module.js/);
  assert.match(js,/buildStorageTopology\(\)/);
  assert.match(js,/THREE.WebGLRenderer/);
  assert.match(js,/OrbitControls/);
  assert.match(js,/select\(item.id\)/);
  assert.match(js,/objectInquiryDialogue/);
  assert.match(publicBuild,/src\/storage-topology.mjs/);
  assert.match(publicBuild,/src\/object-inquiry.mjs/);
  assert.match(localServer,/demo\/storage-volume/);
  assert.ok(!js.includes('fetch('),'no live source requests in visitor study');
});
