/**
 * The curated programme is a *navigation layer*, not an inferred historical network.
 * Every destination must already be a real metadata-supported visible edge.
 * Uses only the original artist-authored scene IDs and the in-memory record list.
 */
import { CURATED_EDGE_SCENES } from './curated-edge-scenes.mjs';
import { societyView } from './archive-society.mjs';

export const CONVERSATION_CHAPTERS = Object.freeze([
  {id:'labor',title:'01 · Work & recognition',description:'Who makes the future, and who receives credit?',sceneIds:[
    'opening-skilled-work-lottery','opening-skilled-work-woman-exhibition',
    'opening-skilled-work-engine','opening-skilled-work-workers-vote',
    'opening-skilled-work-1939','opening-skilled-work-aircraft']},
  {id:'machines',title:'02 · Machines & bodies',description:'What does a machine make possible, and who bears its costs?',sceneIds:[
    'machines-engine-safety','machines-vote-engine']},
  {id:'futures',title:'03 · Political futures',description:'How do images promise, threaten, or recruit a future?',sceneIds:[
    'politics-1939-atlantic-wall','politics-uboats-1939','politics-east-indies-1939','politics-invader-1939']},
  {id:'images',title:'04 · Images & desire',description:'What changes between exhibitions and commercial persuasion?',sceneIds:[
    'commerce-biennale-dye','commerce-heels-biennale']},
  {id:'doubt',title:'05 · Question the network',description:'When should the machine withdraw its own proposed link?',sceneIds:[
    'challenge-robeson-architectural-fantasy','challenge-utrecht-living-rise']}
]);
const sceneById=new Map(CURATED_EDGE_SCENES.map(scene=>[scene.id,scene]));
const chapterIds=new Set(CONVERSATION_CHAPTERS.flatMap(chapter=>chapter.sceneIds));
if(chapterIds.size!==CURATED_EDGE_SCENES.length ||
   [...chapterIds].some(id=>!sceneById.has(id)))throw new Error('Editorial chapter registry must include each curated scene exactly once.');

function supportedEdge(records,scene,seed,target){
  const view=societyView(records,seed,'family');
  const edge=view.edges.find(item=>item.source===seed && item.target===target);
  if(!edge || !edge.reasons.some(reason=>
    reason.family===scene.requires.family && reason.value===scene.requires.value
  ))return null;
  return {seed,target,edgeId:edge.id};
}

/**
 * A curated scene can only be opened if the actual, current family-lens
 * six-neighbor view contains the exact pair and exact scripted source tag.
 * Try both orientations; NEVER create a synthetic link when neither exists.
 */
export function conversationGuide(records){
  const normalized=value=>String(value||'').trim().replace(/\s+/g,'').replace(/[–—]/g,'-').toUpperCase();
  const known=new Map(records.map(item=>[normalized(item.accession),item]));
  return CONVERSATION_CHAPTERS.map(chapter=>({
    id:chapter.id,title:chapter.title,description:chapter.description,
    scenes:chapter.sceneIds.map(id=>{
      const scene=sceneById.get(id);
      const a=known.get(normalized(scene.a)),b=known.get(normalized(scene.b));
      // Use the actual record accession in this capture, not the registry's
      // historical punctuation/spacing variant, to select an existing edge.
      const destination=a&&b&&(supportedEdge(records,scene,a.accession,b.accession)
        ||supportedEdge(records,scene,b.accession,a.accession));
      return {
        id:scene.id,chapter:chapter.id,arc:scene.arc,mode:scene.mode,
        a:scene.a,b:scene.b,
        aTitle:a?.title||null,bTitle:b?.title||null,
        tagFamily:scene.requires.family,tagValue:scene.requires.value,
        next:scene.next,editorialStatus:scene.status,
        available:Boolean(destination),destination:destination||null
      };
    })
  }));
}

export function destinationForScene(guide,sceneId){
  for(const chapter of guide){
    const hit=chapter.scenes.find(scene=>scene.id===sceneId);
    if(hit && hit.available)return hit.destination;
  }
  return null;
}
