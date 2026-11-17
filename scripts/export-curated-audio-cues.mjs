/**
 * Export the authored conversation cue list for one-time, OFFLINE TTS production.
 * No provider credentials, external API calls, or copyrighted museum assets.
 * Use only after editorial/rights signoff; audio is not included in this repo.
 *
 *   node scripts/export-curated-audio-cues.mjs > curated-audio-cues.json
 */
import {createHash} from 'node:crypto';
import {CURATED_EDGE_SCENES} from '../src/curated-edge-scenes.mjs';
import {PERFORMANCE_SCORE, DELIVERY} from '../src/conversation-performance.mjs';
import {withConversationTone,normalizeTone} from '../src/conversation-tones.mjs';

export function audioCues({tone='critical'}={}){
  const selectedTone=normalizeTone(tone);
  return {
    tone:selectedTone,
    schema:'archive-dreams-curated-audio-cues-v1',
    policy:'ARTIST_AUTHORED_DRAFT_NOT_APPROVED',
    note:'Produce once after approval. Use royalty-safe preset voices, not unauthorized voice clones. Keep audio private until distribution rights are confirmed.',
    speakers:{objectA:'Original scripted first reader',objectB:'Original scripted second reader',archivist:'Fictional evidence-bound Archivist'},
    scenes:CURATED_EDGE_SCENES.map(scene=>{
      const directed=withConversationTone({sceneId:scene.id,turns:scene.turns.map((turn,index)=>({...turn,role:turn.speakerAccession==='archivist'?'archivist':index===0?'objectA':'objectB'}))},selectedTone);
      return {
      id:scene.id,
      a:scene.a,b:scene.b,arc:scene.arc,status:scene.status,
      performance:{question:PERFORMANCE_SCORE[scene.id]?.question||null,tension:PERFORMANCE_SCORE[scene.id]?.tension||null},
      turns:directed.turns.map((turn,index)=>{
        const role=turn.speakerAccession==='archivist'?'archivist':index===0?'objectA':'objectB';
        const digest=createHash('sha256').update(turn.text,'utf8').digest('hex').slice(0,16);
        const delivery=PERFORMANCE_SCORE[scene.id]?.beat[index]||'observe';
        return {
          index,role,speakerAccession:turn.speakerAccession,
          delivery,direction:DELIVERY[delivery]?.label||'reads',
          rate:DELIVERY[delivery]?.rate||1,pitch:DELIVERY[delivery]?.pitch||1,
          text:turn.text,textSha256Prefix:digest,
          proposedFile:'audio/'+selectedTone+'/'+scene.id+'/turn-'+(index+1)+'-'+digest+'.mp3',
          status:'NOT_RENDERED'
        };
      })
    };})
  };
}
if(process.argv[1] && new URL('file://'+process.argv[1]).pathname===new URL(import.meta.url).pathname){
  const arg=process.argv.find(part=>part.startsWith('--tone='));
  process.stdout.write(JSON.stringify(audioCues({tone:arg?.slice('--tone='.length)||'critical'}),null,2)+'\n');
}
