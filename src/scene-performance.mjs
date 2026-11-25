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

/**
 * A readable visual-only score for the original authored words.
 * "Duration" is editorial presentation timing, NOT a claim about model
 * processing speed, an audio recording, or a historically spoken utterance.
 */
export const PERFORMANCE_LEAD_MS=360;
export const PERFORMANCE_MIN_TURN_MS=1550;
export const PERFORMANCE_MAX_TURN_MS=3500;
export const PERFORMANCE_CHAR_MS=27;

export function performedScenePlan(episode){
  if(!scriptedScenePlan(episode).length)return [];
  if(episode.turns.some(turn=>typeof turn.text!=='string'||!turn.text.trim()))return [];
  let cursor=PERFORMANCE_LEAD_MS;
  const turns=episode.turns.map((turn,index)=>{
    const count=Array.from(turn.text).length;
    const duration=Math.max(PERFORMANCE_MIN_TURN_MS,Math.min(PERFORMANCE_MAX_TURN_MS,count*PERFORMANCE_CHAR_MS+350));
    const cue={kind:'turn',role:turn.role,index,at:cursor,duration};
    cursor+=duration;
    return cue;
  });
  return [{kind:'convene',at:0},...turns,{kind:'complete',at:cursor}];
}
