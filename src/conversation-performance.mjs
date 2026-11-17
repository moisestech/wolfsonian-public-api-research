/**
 * Conversation Performance Director
 *
 * Artist-authored direction is separate from historical evidence and object
 * metadata. It controls only pacing/casting of fictional speech, never facts.
 * Choosing a different voice never upgrades an interpretation into evidence.
 */
import {localVoiceOptions} from './local-voice-cast.mjs';

export const DELIVERY=Object.freeze({
  observe: Object.freeze({label:'observes',rate:0.94,pitch:0.99}),
  provoke: Object.freeze({label:'challenges',rate:1.03,pitch:1.04}),
  question: Object.freeze({label:'questions',rate:0.96,pitch:1.02}),
  insist: Object.freeze({label:'insists',rate:0.98,pitch:1.03}),
  speculate: Object.freeze({label:'imagines',rate:0.97,pitch:1.05}),
  reflect: Object.freeze({label:'reconsiders',rate:0.90,pitch:0.98}),
  caution: Object.freeze({label:'warns',rate:0.92,pitch:0.95}),
  doubt: Object.freeze({label:'doubts the connection',rate:0.89,pitch:1}),
  document: Object.freeze({label:'sets the evidence boundary',rate:0.89,pitch:0.96})
});

/**
 * A three-beat editorial score for each of the 16 commissioned edges.
 * Beat 0 proposes a position, 1 challenges it, 2 names a source boundary.
 * Voice performance is fictional, not a historical-person impersonation.
 */
export const PERFORMANCE_SCORE=Object.freeze({
  'opening-skilled-work-lottery':{beat:['observe','provoke','document'],question:'Can an exhibition make labor visible without giving workers a voice?',tension:'Recognition versus representation'},
  'opening-skilled-work-woman-exhibition':{beat:['insist','question','document'],question:'Who chooses what work becomes public memory?',tension:'Skill versus exhibition'},
  'opening-skilled-work-engine':{beat:['observe','insist','document'],question:'When the engine is named, who else is present?',tension:'Production versus the producer'},
  'opening-skilled-work-workers-vote':{beat:['observe','provoke','document'],question:'Does visibility become political agency?',tension:'Depiction versus address'},
  'opening-skilled-work-1939':{beat:['question','speculate','document'],question:'Does naming a year produce a future?',tension:'Wartime work versus future image'},
  'opening-skilled-work-aircraft':{beat:['reflect','insist','document'],question:'What disappears between the workshop and the aerial view?',tension:'Labor versus spectacle'},
  'machines-engine-safety':{beat:['observe','caution','document'],question:'Who pays for technical progress?',tension:'Making versus exposure'},
  'machines-vote-engine':{beat:['provoke','reflect','document'],question:'Is showing labor equivalent to hearing labor?',tension:'Political agency versus representation'},
  'politics-1939-atlantic-wall':{beat:['speculate','insist','document'],question:'Why does one image argue against another year?',tension:'Future versus remembered crisis'},
  'politics-uboats-1939':{beat:['insist','question','document'],question:'Who is invited into the word our?',tension:'National rhetoric versus public imagination'},
  'challenge-robeson-architectural-fantasy':{beat:['doubt','question','document'],question:'Should this link exist at all?',tension:'Personal history versus generic trees tag'},
  'commerce-biennale-dye':{beat:['observe','provoke','document'],question:'What changes when a motif sells something?',tension:'Art prestige versus persuasion'},
  'politics-east-indies-1939':{beat:['insist','question','document'],question:'Whose future is being claimed?',tension:'Political demand versus dated forecast'},
  'challenge-utrecht-living-rise':{beat:['doubt','doubt','document'],question:'When should the algorithm withdraw?',tension:'Shared motif versus unsupported relation'},
  'politics-invader-1939':{beat:['caution','speculate','document'],question:'Whose future is described as dangerous?',tension:'Threat versus promise'},
  'commerce-heels-biennale':{beat:['provoke','reflect','document'],question:'Does the same myth ask an audience to want different things?',tension:'Commodity versus institution'}
});

function hash(value){
  let n=2166136261;
  for(const ch of String(value)){n^=ch.codePointAt(0);n=Math.imul(n,16777619);}
  return n>>>0;
}
function accessionForTurn(conversation,turn){
  return turn.role==='archivist'?'fictional-archivist':
    turn.role==='objectA'?conversation.source:
    turn.role==='objectB'?conversation.target:'fictional-unassigned';
}
function safeVoice(v,available){return available.find(item=>item.voiceURI===v)||null;}

/**
 * Make one deterministic, device-local performance plan for a conversation.
 *
 * Each scene uses its own voice palette. An accession's voice may change in
 * another scene, but does not change between repeated plays of this scene.
 * Overrides are explicitly chosen by a human, never based on demographics.
 * With 1-2 installed voices, graceful reuse is unavoidable.
 */
export function directConversation(conversation,voices=[],roleOverrides={},opts={}){
  if(!conversation||!Array.isArray(conversation.turns))return {sceneId:null,localOnly:true,turns:[]};
  const available=localVoiceOptions(voices);
  const sceneId=conversation.sceneId||conversation.id||'metadata-fallback';
  const score=PERFORMANCE_SCORE[conversation.sceneId]||null;
  const style=opts.style==='continuity'?'continuity':'scene-variety';
  const allocated=new Set(),assigned=new Map();
  const parts=conversation.turns.map((turn,index)=>{
    const speakerId=accessionForTurn(conversation,turn);
    const label=score?.beat[index]||(
      turn.role==='archivist'?'document':index===0?'observe':'question'
    );
    const delivery=DELIVERY[label]||DELIVERY.observe;
    const override=safeVoice(roleOverrides[turn.role],available);
    const stableSeed=style==='continuity'?speakerId:sceneId+'|'+speakerId+'|'+label;
    let voice=override||assigned.get(speakerId)||null;
    if(!voice&&available.length){
      const preferred=hash(stableSeed)%available.length;
      if(style==='continuity'){
        // Absolute accession identity wins over differentiation: the same
        // object keeps its voice even if another scene introduces a collision.
        voice=available[preferred];
      }else{
        for(let step=0;step<available.length;step++){
          const candidate=available[(preferred+step)%available.length];
          if(!allocated.has(candidate.voiceURI)){voice=candidate;break;}
        }
        if(!voice)voice=available[preferred];
      }
    }
    if(voice){assigned.set(speakerId,voice);allocated.add(voice.voiceURI);}
    return {
      index,role:turn.role,speakerId,delivery:label,direction:delivery.label,
      rate:delivery.rate,pitch:delivery.pitch,voice:voice||null,
      voiceURI:voice?.voiceURI||null,
      engine:'browser-local-only'
    };
  });
  return {
    sceneId,style,localOnly:true,editorialQuestion:score?.question||null,
    tension:score?.tension||null,turns:parts
  };
}
