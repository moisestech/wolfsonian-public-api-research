import test from 'node:test';
import assert from 'node:assert/strict';
import { listenerReflection, PERSPECTIVE_VOICES, accessionKey } from '../src/conversation-voices.mjs';
import { CURATORIAL_PATHS, juxtapositionConversation, pathwayContinuations } from '../src/curatorial-relationships.mjs';
import { auditDataQuality, auditInteractionLanguage } from '../src/conversation-editorial.mjs';
import { CURATED_EDGE_SCENES } from '../src/curated-edge-scenes.mjs';
import { conversationEpisode } from '../src/conversation-orientation.mjs';

test('all eleven listener readings preserve each pathway’s exact object transcript and attribution',()=>{
  for(const path of CURATORIAL_PATHS){
    const original=juxtapositionConversation(path).turns;
    const episodeId=conversationEpisode({source:path.source,target:path.target,conversation:juxtapositionConversation(path)}).id;
    const questions=new Set();
    for(const voice of PERSPECTIVE_VOICES){
      const c=juxtapositionConversation(path,voice.id);
      assert.deepEqual(c.turns,original,'The listener must not rewrite the historical object voice');
      assert.equal(c.voiceBrief.perspective.id,voice.id);
      assert.equal(c.listenerReflection.perspectiveId,voice.id);
      assert.equal(c.listenerReflection.source,path.source.accession);
      assert.equal(c.listenerReflection.target,path.target.accession);
      assert.equal(c.listenerReflection.focus,path.arc);
      assert.equal(c.listenerReflection.includedInObjectAudio,false);
      assert.notEqual(c.listenerReflection.counterPerspective.id,voice.id);
      assert.ok(c.listenerReflection.presentDayQuestion.endsWith('?'));
      assert.ok(!c.turns.some(t=>t.role==='listener'));
      questions.add(c.listenerReflection.objectQuestion);
      const episode=conversationEpisode({source:path.source,target:path.target,conversation:c});
      assert.equal(episode.listenerReflection,c.listenerReflection);
      assert.equal(episode.id,episodeId,'A new perspective is not a new conversational edge');
    }
    assert.equal(questions.size,11);
  }
});

test('onward pathways must share a real exact accession and cannot loop to the current pair',()=>{
  for(const path of CURATORIAL_PATHS){
    assert.ok(path.followUp.length>20);
    const choices=pathwayContinuations(path.id);
    assert.ok(choices.length>=1&&choices.length<=3);
    assert.equal(new Set(choices.map(c=>c.id)).size,choices.length);
    for(const choice of choices){
      assert.notEqual(choice.id,path.id);
      const target=CURATORIAL_PATHS.find(p=>p.id===choice.id);
      assert.ok(target);
      for(const id of choice.sharedAccessions){
        assert.ok([path.source.accession,path.target.accession].some(a=>accessionKey(a)===accessionKey(id)));
        assert.ok([target.source.accession,target.target.accession].some(a=>accessionKey(a)===accessionKey(id)));
      }
      assert.equal(choice.historicalRelationshipEstablished,false);
      assert.equal(choice.kind,'ARTIST_AUTHORED_ROUTE');
    }
  }
  assert.deepEqual(pathwayContinuations('unknown'),[]);
  assert.deepEqual(pathwayContinuations(CURATORIAL_PATHS[0].id,0),[]);
});

test('data gaps and canonical duplicate IDs are reported rather than filled from a title',()=>{
  const records=[{accession:'A',title:'1939 A.D',tags:[{family:'theme',value:'Unlabeled'}]},{accession:' A ',title:'Alias'}];
  const report=auditDataQuality(records);
  assert.deepEqual(report.duplicateAccessions,[' A ']);
  assert.equal(report.missingDateContext.length,2);
  assert.equal(report.noUsableThemeOrMotif.length,2);
  assert.equal(records[0].date,undefined);
});

test('the complete language audit reports all forty scripts and every pathway without certifying quality',()=>{
  const audit=auditInteractionLanguage(CURATED_EDGE_SCENES,CURATORIAL_PATHS);
  assert.equal(audit.scenes,40);
  assert.equal(audit.revisedScenes,30);
  assert.equal(audit.pathwayFollowUps,20);
  assert.deepEqual(audit.pathwaysWithoutOnwardChoices,[]);
  assert.ok(audit.rows.every(r=>r.reviewStatus==='READ_ALOUD_AND_ARTIST_REVIEW_PENDING'));
  assert.equal(listenerReflection({},{}),null);
});
