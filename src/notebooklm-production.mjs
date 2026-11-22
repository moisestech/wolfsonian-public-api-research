/** Production planning only. No NotebookLM API, audio generation or source upload. */
import { accessionKey } from './conversation-voices.mjs';

export const NOTEBOOKLM_HELP='https://support.google.com/notebooklm/answer/16212820?hl=en';
export const FIRST_FIVE=Object.freeze(['radio-and-television','program-and-booklet','globe-and-theme-center','poster-and-program','catalogue-and-globe']);
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
      const focus=`Make a compact ${format} about “${row.question}” for the independent artist project Archive Dreams in Public. Discuss only ${cast.map(r=>r.title+' ('+r.accession+')').join(' and ')}. The two hosts are present-day research listeners, not the objects, historical people or museum staff. Give the two objects different stakes; let one host question a specific premise and the other reconsider it. Use only the supplied public museum sources for facts. Distinguish source facts from authored interpretation. Do not invent owners, visits, audiences, inscriptions, workers, influence or a meeting between the objects. Contemporary parallels may appear only as listener questions; do not put future knowledge into object speech. Vary dry wit, warmth and occasional absurdity where appropriate; use a serious register for war, injury, political coercion and loss. Do not quote unverified period slang. Stay with one question, aim for 45–90 seconds if possible, and omit generic introductions and padding. Close by opening this inquiry: ${row.closing||row.question} The length is an editorial target, not permission to invent or repeat.`;
      return {sceneId:row.id,question:row.question,kind:row.kind,cast,sourceGate,missingPublicSources:missing,sourceUrls,format,language:'English',lengthSetting:'Shorter if available',targetSeconds:[45,90],scriptWords:words(row.turns),scriptTurns:row.turns.length,languageRevision:row.revision||null,limits:row.limit,focusPrompt:focus,
        notebookUrl:null,audioFile:null,actualSeconds:null,factCheck:null,listeningReview:null,outputStatus:'NO_OUTPUT_VERIFIED_IN_THIS_AUDIT',
        uploadRule:'Use one scene-specific authored brief and only its listed museum-published sources. Never upload the full registry, staff matrix, Lakehouse captures, private research or restricted imagery. Hold rows with missing primary sources.',
      };
    });
  rows.sort((a,b)=>{
    const rank=x=>FIRST_FIVE.includes(x.sceneId)?FIRST_FIVE.indexOf(x.sceneId):x.sourceGate==='PUBLIC_SOURCE_PACKET_AVAILABLE'?10:20;
    return rank(a)-rank(b)||a.sceneId.localeCompare(b.sceneId);
  });
  return rows.map((row,i)=>({...row,sequence:i+1,productionId:'AS-NLM-'+row.sceneId,priority:i<5?'P0':row.sourceGate==='PUBLIC_SOURCE_PACKET_AVAILABLE'?'P1':'SOURCE_HOLD',exportBasename:'as-nlm__'+row.sceneId.replace(/[^a-z0-9-]+/gi,'-').toLowerCase()+'__take01'}));
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
