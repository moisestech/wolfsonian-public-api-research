/**
 * A deterministic visual performance score based only on approved, authored
 * conversation turns. No generative model or historical inference is involved.
 *
 * These are local UI choreography cues, NOT AG-UI agent events, reasoning traces
 * or museum statements. The full written transcript always remains available.
 */
const ALLOWED_ROLES=new Set(['objectA','objectB','archivist']);
export const SCENE_TURN_DELAY_MS=280;
export const SCENE_TURN_INTERVAL_MS=320;

export function scriptedScenePlan(episode){
  if(episode?.mode!=='CURATED_SCRIPT'||!Array.isArray(episode.turns))return [];
  if(!episode.turns.length||episode.turns.length>12)return [];
  if(episode.turns.some(turn=>!ALLOWED_ROLES.has(turn?.role)))return [];
  return [
    {kind:'convene',at:0},
    ...episode.turns.map((turn,index)=>({
      kind:'turn',role:turn.role,index,
      at:SCENE_TURN_DELAY_MS+index*SCENE_TURN_INTERVAL_MS
    })),
    {kind:'complete',at:SCENE_TURN_DELAY_MS+episode.turns.length*SCENE_TURN_INTERVAL_MS}
  ];
}
