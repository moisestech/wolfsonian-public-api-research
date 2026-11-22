/** Production planning only. No NotebookLM API, audio generation or source upload. */
import { accessionKey } from './conversation-voices.mjs';

export const NOTEBOOKLM_HELP='https://support.google.com/notebooklm/answer/16212820?hl=en';
export const FIRST_FIVE=Object.freeze(['radio-and-television','program-and-booklet','globe-and-theme-center','poster-and-program','catalogue-and-globe']);
const PILOT_TREATMENTS=Object.freeze({
  'radio-and-television':{
    tension:'Receiving more information versus having the ability to answer back.',
    opening:'Begin with the attraction of receiving pictures as well as sound.',
    turn:'Challenge whether richer reception gives the audience more agency; reconsider what it means to answer.',
    ending:'Leave the listener considering what a receiver cannot tell us about its audience.',
    tone:'Warm banter with one dry interruption; no invented household or broadcast.',
  },
  'program-and-booklet':{
    tension:'A future addressed as “your” versus a promise that can be kept as a souvenir.',
    opening:'Begin with the possessive “your,” then contrast an invitation with a portable booklet.',
    turn:'Let the attractive idea of taking a future home run into the question of whether the promise was delivered.',
    ending:'Leave the difference between possessing the publication and possessing the promised future unresolved.',
    tone:'Lightly amused, then reflective; keep the 1940 booklet distinct from the 1939 book spread.',
  },
  'globe-and-theme-center':{
    tension:'Making a world manageable at small scale versus seeing what the boundary excludes.',
    opening:'Begin with the physical act of looking around a model or turning a globe-shaped vessel.',
    turn:'Concede that a change of scale is useful, then ask why useful does not mean complete.',
    ending:'Return attention to an edge, surface or boundary rather than closing with a grand moral.',
    tone:'Quiet curiosity and dry precision; no invented shared exhibition or design influence.',
  },
  'poster-and-program':{
    tension:'An illustrated crowd versus the people actually addressed by an invitation.',
    opening:'Start with the poster’s persuasive crowd, then hear the program’s “your.”',
    turn:'Correct the tempting assumption that a pictured queue establishes an actual public or equal welcome.',
    ending:'Ask whose account could complicate the attractive invitation, without inventing that account.',
    tone:'Critical but hospitable; a real reconsideration rather than a denunciation.',
  },
  'catalogue-and-globe':{
    tension:'A sweeping era label versus the distinct named tasks of making an object.',
    opening:'Let the confidence of “Machine Age” meet the vase record’s separate form, décor and decoration roles.',
    turn:'Keep the usefulness of a heading while admitting it cannot replace those distinctions.',
    ending:'Return to a particular name or role that a general label might flatten.',
    tone:'Gentle editorial irony; no quotation or summary of unseen catalogue essays.',
  },
});
const words=turns=>turns.reduce((n,t)=>n+String(t.text||'').trim().split(/\s+/).filter(Boolean).length,0);
const museumUrl=url=>{try{return new URL(url).hostname==='wolfsonian.org';}catch{return false;}};
export function notebookProductionManifest({scenes,paths,records,publicSources,displayQuestions={}}) {
  const byId=new Map(records.map(r=>[accessionKey(r.accession),r]));
  const sources=new Map(publicSources.filter(s=>Array.isArray(s.urls)&&s.urls.some(museumUrl)).map(s=>[accessionKey(s.accession),s]));
  const rows=[...scenes.map(s=>({id:s.id,question:displayQuestions[s.id]||s.arc,cast:s.pair.map(a=>byId.get(accessionKey(a))||{accession:a,title:a}),turns:s.turns,kind:'metadata',limit:s.editorialNote,closing:s.next,revision:s.languageRevision})),
    ...paths.map(p=>({id:p.id,question:p.arc,cast:[p.source,p.target],turns:p.turns,kind:'pathway',limit:p.limits,closing:p.followUp,revision:p.languageRevision}))].map(row=>{
      const missing=row.cast.filter(r=>!sources.has(accessionKey(r.accession))).map(r=>r.accession);
      const cast=row.cast.map(r=>{const publicRecord=sources.get(accessionKey(r.accession));return {accession:r.accession,title:publicRecord?.title||r.title,date:publicRecord?.date||'',sourceStatus:publicRecord?'PUBLIC_RESEARCH_PACKET':'PRIMARY_SOURCE_NEEDED'};});
      const sourceUrls=[...new Set(cast.flatMap(r=>sources.get(accessionKey(r.accession))?.urls||[]).filter(museumUrl))];
      const sourceGate=missing.length?'HOLD_PRIMARY_SOURCES':'PUBLIC_SOURCE_PACKET_AVAILABLE';
      const format=['program-and-booklet','catalogue-and-globe'].includes(row.id)||/politics|commerce/.test(row.id)?'Debate':'Deep Dive';
      const treatment=PILOT_TREATMENTS[row.id]||null;
      const focus=`Make a compact ${format} about “${row.question}” for the independent artist project Archive Dreams in Public. Discuss only ${cast.map(r=>r.title+' ('+r.accession+')').join(' and ')}. The two hosts are present-day research listeners, not the objects, historical people or museum staff. Give the two objects different stakes; let one host question a specific premise and the other reconsider it. Use only the supplied public museum sources for facts. Distinguish source facts from authored interpretation. Do not invent owners, visits, audiences, inscriptions, workers, influence or a meeting between the objects. Contemporary parallels may appear only as listener questions; do not put future knowledge into object speech. Vary dry wit, warmth and occasional absurdity where appropriate; use a serious register for war, injury, political coercion and loss. Do not quote unverified period slang. Stay with one question, aim for 45–90 seconds if possible, and omit generic introductions and padding. Close by opening this inquiry: ${row.closing||row.question} The length is an editorial target, not permission to invent or repeat.`;
      const specific=treatment?` Pair-specific direction: ${treatment.tension} Opening: ${treatment.opening} Turning point: ${treatment.turn} Ending: ${treatment.ending} Delivery: ${treatment.tone}`:'';
      return {sceneId:row.id,question:row.question,kind:row.kind,cast,sourceGate,missingPublicSources:missing,sourceUrls,format,language:'English',lengthSetting:'Shorter if available',targetSeconds:[45,90],scriptWords:words(row.turns),scriptTurns:row.turns.length,languageRevision:row.revision||null,limits:row.limit,treatment,focusPrompt:focus+specific,
        notebookUrl:null,audioFile:null,actualSeconds:null,factCheck:null,listeningReview:null,outputStatus:'NO_OUTPUT_VERIFIED_IN_THIS_AUDIT',
        uploadRule:'Use one scene-specific authored brief and only its listed museum-published sources. Never upload the full registry, staff matrix, Lakehouse captures, private research or restricted imagery. Hold rows with missing primary sources.',
      };
    });
  rows.sort((a,b)=>{
    const rank=x=>x.sourceGate==='HOLD_PRIMARY_SOURCES'?20:FIRST_FIVE.includes(x.sceneId)?FIRST_FIVE.indexOf(x.sceneId):10;
    return rank(a)-rank(b)||a.sceneId.localeCompare(b.sceneId);
  });
  return rows.map((row,i)=>({...row,sequence:i+1,productionId:'AS-NLM-'+row.sceneId,priority:row.sourceGate==='HOLD_PRIMARY_SOURCES'?'SOURCE_HOLD':FIRST_FIVE.includes(row.sceneId)?'P0':'P1',exportBasename:'as-nlm__'+row.sceneId.replace(/[^a-z0-9-]+/gi,'-').toLowerCase()+'__take01'}));
}

/** Research leverage, not historical importance or permission to generate. */
export function sourceResearchQueue(manifest) {
  const gaps=new Map();
  for(const row of manifest){
    if(row.sourceGate!=='HOLD_PRIMARY_SOURCES')continue;
    for(const accession of new Set(row.missingPublicSources)){
      const key=accessionKey(accession),entry=gaps.get(key)||{accession,title:row.cast.find(c=>accessionKey(c.accession)===key)?.title||accession,affectedScenes:[],immediatelyUnlockableScenes:[]};
      entry.affectedScenes.push(row.sceneId);
      if(row.missingPublicSources.length===1)entry.immediatelyUnlockableScenes.push(row.sceneId);
      gaps.set(key,entry);
    }
  }
  return [...gaps.values()].map(entry=>({...entry,potentialConversations:entry.affectedScenes.length,oneSourceAway:entry.immediatelyUnlockableScenes.length,
    action:'Locate and inspect a public primary-source passage for this exact object; record the locator and evidence limits. Recompute the queue after source review.',
  })).sort((a,b)=>b.oneSourceAway-a.oneSourceAway||b.potentialConversations-a.potentialConversations||a.accession.localeCompare(b.accession));
}

export function productionAnalytics(manifest) {
  const lengths=manifest.map(r=>r.scriptWords).sort((a,b)=>a-b);
  const degree=new Map(),turns={},formats={};
  for(const row of manifest){for(const object of row.cast)degree.set(object.accession,(degree.get(object.accession)||0)+1);turns[row.scriptTurns]=(turns[row.scriptTurns]||0)+1;formats[row.format]=(formats[row.format]||0)+1;}
  const midpoint=Math.floor(lengths.length/2);
  return {conversations:manifest.length,castObjects:degree.size,publicSourcePackets:manifest.filter(r=>r.sourceGate==='PUBLIC_SOURCE_PACKET_AVAILABLE').length,sourceHolds:manifest.filter(r=>r.sourceGate==='HOLD_PRIMARY_SOURCES').length,
    revised:manifest.filter(r=>r.languageRevision).length,retained:manifest.filter(r=>!r.languageRevision).length,
    scriptWords:{total:lengths.reduce((n,v)=>n+v,0),min:lengths[0]??null,median:lengths.length?(lengths.length%2?lengths[midpoint]:(lengths[midpoint-1]+lengths[midpoint])/2):null,max:lengths.at(-1)??null},
    turns,formats,objectDegree:[...degree].map(([accession,conversations])=>({accession,conversations})).sort((a,b)=>b.conversations-a.conversations||a.accession.localeCompare(b.accession)),
    targetTotalMinutes:[manifest.length*45/60,manifest.length*90/60],actualAudioAnalytics:'UNVERIFIED: no listening scores, durations or output count inferred from planning documents',
  };
}
