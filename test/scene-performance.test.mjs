import test from 'node:test';
import assert from 'node:assert/strict';
import {scriptedScenePlan,SCENE_TURN_DELAY_MS,SCENE_TURN_INTERVAL_MS} from '../src/scene-performance.mjs';

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
