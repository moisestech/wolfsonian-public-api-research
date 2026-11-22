import test from 'node:test';
import assert from 'node:assert/strict';
import {notebookProductionManifest,productionAnalytics,sourceResearchQueue} from '../src/notebooklm-production.mjs';
const scene={id:'pair-one',arc:'Who gets invited?',pair:['A','B'],turns:[{text:'One short line.'},{text:'Another short line.'}],editorialNote:'No shared audience established.',next:'Inspect the invitation.'};
const args={scenes:[scene],paths:[],records:[{accession:'A',title:'Invitation'},{accession:'B',title:'Program'}],publicSources:[{accession:'A',title:'Invitation',date:'1939',urls:['https://wolfsonian.org/a','https://example.com/unreviewed']}]};

test('one public object cannot clear a pair’s source hold; private tags are not source substitutes',()=>{
 const [row]=notebookProductionManifest(args);
 assert.equal(row.sourceGate,'HOLD_PRIMARY_SOURCES');
 assert.deepEqual(row.missingPublicSources,['B']);
 assert.deepEqual(row.sourceUrls,['https://wolfsonian.org/a']);
 assert.equal(row.actualSeconds,null);
 assert.equal(row.notebookUrl,null);
 assert.equal(row.factCheck,null);
});
test('a preferred pilot never receives production priority while its sources are on hold',()=>{
 const [row]=notebookProductionManifest({...args,scenes:[{...scene,id:'radio-and-television'}]});
 assert.equal(row.sourceGate,'HOLD_PRIMARY_SOURCES');
 assert.equal(row.priority,'SOURCE_HOLD');
});
test('source research prioritizes completed-pair opportunities and never clears a hold itself',()=>{
 const manifest=[
  {sceneId:'one',sourceGate:'HOLD_PRIMARY_SOURCES',missingPublicSources:['B'],cast:[{accession:'A',title:'A'},{accession:'B',title:'B'}]},
  {sceneId:'two',sourceGate:'HOLD_PRIMARY_SOURCES',missingPublicSources:['B','C'],cast:[{accession:'B',title:'B'},{accession:'C',title:'C'}]},
 ];
 const queue=sourceResearchQueue(manifest);
 assert.equal(queue[0].accession,'B');
 assert.equal(queue[0].oneSourceAway,1);
 assert.equal(queue[0].potentialConversations,2);
 assert.equal(queue[1].oneSourceAway,0);
 assert.ok(manifest.every(row=>row.sourceGate==='HOLD_PRIMARY_SOURCES'));
});
test('the radio pilot has a specific argument rather than only generic disagreement instructions',()=>{
 const [row]=notebookProductionManifest({...args,scenes:[{...scene,id:'radio-and-television'}]});
 assert.match(row.treatment.tension,/ability to answer back/);
 assert.match(row.focusPrompt,/Turning point:/);
 assert.match(row.focusPrompt,/richer reception gives the audience more agency/);
 assert.match(row.treatment.tone,/no invented household/);
});
test('availability of both public packets is distinct from audio generation and approval',()=>{
 const rows=notebookProductionManifest({...args,publicSources:[...args.publicSources,{accession:'B',title:'Program',urls:['https://wolfsonian.org/b']}]});
 assert.equal(rows[0].sourceGate,'PUBLIC_SOURCE_PACKET_AVAILABLE');
 assert.equal(rows[0].outputStatus,'NO_OUTPUT_VERIFIED_IN_THIS_AUDIT');
 assert.match(rows[0].focusPrompt,/present-day research listeners/);
 assert.match(rows[0].focusPrompt,/45–90 seconds/);
 assert.equal(productionAnalytics(rows).publicSourcePackets,1);
 assert.match(productionAnalytics(rows).actualAudioAnalytics,/UNVERIFIED/);
});
test('stable production IDs survive a changed ordering and display questions match the app',()=>{
 const first=notebookProductionManifest({...args,displayQuestions:{'pair-one':'A better visitor question?'}})[0];
 const more=notebookProductionManifest({...args,scenes:[{...scene,id:'earlier-pair'},scene]});
 assert.equal(first.productionId,more.find(x=>x.sceneId==='pair-one').productionId);
 assert.equal(first.question,'A better visitor question?');
 assert.equal(first.exportBasename,more.find(x=>x.sceneId==='pair-one').exportBasename);
});
