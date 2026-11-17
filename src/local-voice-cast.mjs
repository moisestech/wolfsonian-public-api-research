/**
 * Zero-API-cost browser voice casting.
 * Only localService=true voices qualify: no implicit cloud synthesis.
 * Actual installed voices vary by visitor device and operating system.
 */
export const SPEAKER_ROLES=Object.freeze(['objectA','objectB','archivist']);
const local=voices=>Array.from(voices||[]).filter(v=>
  v && v.localService===true && typeof v.voiceURI==='string' && v.voiceURI.length>0
);
const preferred=voice=>(/^en(?:-|$)/i.test(voice.lang||'')?0:1);
export function localVoiceOptions(voices) {
  return local(voices).sort((a,b)=>preferred(a)-preferred(b)
    ||String(a.lang).localeCompare(String(b.lang))
    ||String(a.name).localeCompare(String(b.name)));
}
export function roleVoiceCast(voices, selections={}) {
  const options=localVoiceOptions(voices),used=new Set(),cast={};
  for(const [i,role] of SPEAKER_ROLES.entries()){
    const requested=options.find(v=>v.voiceURI===selections[role]);
    let chosen=requested;
    if(!chosen)chosen=options.find(v=>!used.has(v.voiceURI))||options[i%options.length];
    if(chosen)used.add(chosen.voiceURI);
    cast[role]=chosen||null;
  }
  return cast;
}
