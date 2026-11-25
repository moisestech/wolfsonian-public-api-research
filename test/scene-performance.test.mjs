import test from 'node:test';
import assert from 'node:assert/strict';
import {scriptedScenePlan,performedScenePlan,SCENE_TURN_DELAY_MS,SCENE_TURN_INTERVAL_MS,PERFORMANCE_LEAD_MS,PERFORMANCE_MIN_TURN_MS,PERFORMANCE_MAX_TURN_MS} from '../src/scene-performance.mjs';

const scene={mode:'CURATED_SCRIPT',turns:[
  {role:'objectA',text:'Not a historical statement'},
  {role:'objectB',text:'An editorial reply'},
  {role:'objectA',text:'A second thought'},
  {role:'archivist',text:'Metadata is not evidence'},
  {role:'objectB',text:'The question remains open'}
]};

test('choreography follows exactly the five existing roles with no invented text',()=>{
  const plan=scriptedScenePlan(scene);
  assert.deepEqual(plan.map(event=>event.kind),['convene','turn','turn','turn','turn','turn','complete']);
  assert.deepEqual(plan.filter(event=>event.kind==='turn').map(event=>event.role),
    ['objectA','objectB','objectA','archivist','objectB']);
  assert.deepEqual(plan.filter(event=>event.kind==='turn').map(event=>event.index),[0,1,2,3,4]);
  assert.equal(plan[1].at,SCENE_TURN_DELAY_MS);
  assert.equal(plan.at(-1).at,SCENE_TURN_DELAY_MS+scene.turns.length*SCENE_TURN_INTERVAL_MS);
  assert.ok(plan.every(event=>!('text' in event)&&!('reasoning' in event)&&!('citation' in event)));
});
test('no silent animation for research prompts, invalid roles or unbounded transcripts',()=>{
  assert.deepEqual(scriptedScenePlan({...scene,mode:'RESEARCH_PROMPT'}),[]);
  assert.deepEqual(scriptedScenePlan({...scene,turns:[{role:'model'}]}),[]);
  assert.deepEqual(scriptedScenePlan({...scene,turns:[]}),[]);
  assert.deepEqual(scriptedScenePlan({...scene,turns:Array(13).fill({role:'objectA'})}),[]);
  assert.deepEqual(scriptedScenePlan(null),[]);
});

test('performed score is paced for reading without generating new conversation content',()=>{
  const cues=performedScenePlan(scene);
  assert.deepEqual(cues.map(item=>item.kind),['convene','turn','turn','turn','turn','turn','complete']);
  assert.deepEqual(cues.slice(1,-1).map(item=>item.index),[0,1,2,3,4]);
  assert.deepEqual(cues.slice(1,-1).map(item=>item.role),scene.turns.map(item=>item.role));
  assert.equal(cues[1].at,PERFORMANCE_LEAD_MS);
  assert.ok(cues.slice(1,-1).every(item=>item.duration>=PERFORMANCE_MIN_TURN_MS&&item.duration<=PERFORMANCE_MAX_TURN_MS));
  for(let i=2;i<cues.length-1;i++)assert.equal(cues[i].at,cues[i-1].at+cues[i-1].duration);
  assert.equal(cues.at(-1).at,cues.at(-2).at+cues.at(-2).duration);
  assert.ok(cues.at(-1).at>scene.turns.length*SCENE_TURN_INTERVAL_MS);
  assert.ok(cues.every(item=>!('text' in item)&&!('thought' in item)&&!('reasoning' in item)&&!('citation' in item)));
});
test('performance duration grows with authored turn length while respecting the budget',()=>{
  const short=performedScenePlan({mode:'CURATED_SCRIPT',turns:[{role:'objectA',text:'Hello.'}]});
  const long=performedScenePlan({mode:'CURATED_SCRIPT',turns:[{role:'objectA',text:'Archival uncertainty '.repeat(30)}]});
  assert.ok(long[1].duration>short[1].duration);
  assert.equal(long[1].duration,PERFORMANCE_MAX_TURN_MS);
});
test('no performed score for invalid voice, empty transcript, research prompt or fabricated text',()=>{
  assert.deepEqual(performedScenePlan(null),[]);
  assert.deepEqual(performedScenePlan({...scene,mode:'RESEARCH_PROMPT'}),[]);
  assert.deepEqual(performedScenePlan({...scene,turns:[{role:'model',text:'thinking'}]}),[]);
  assert.deepEqual(performedScenePlan({...scene,turns:[{role:'objectA'}]}),[]);
  assert.deepEqual(performedScenePlan({...scene,turns:[{role:'objectA',text:' '}]}),[]);
});
