#!/usr/bin/env node
/**
 * Produce a self-contained, local-only listening room from the ten authored
 * research scenes. This is a private review artifact, not a site route,
 * audio provider integration, or new institutionally approved dialogue.
 */
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {dirname,join,resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const scratch=resolve(root,'.local-research');
const manifestPath=join(root,'data/research/audio-lab/experiments.json');
const templatePath=join(root,'tools/audio-lab/listening-room-template.html');
export const DEFAULT_LISTENING_ROOM=join(scratch,'audio-lab','review.html');

export function safeAudioScenes(manifest){
  if(manifest?.schemaVersion!==1||!Array.isArray(manifest.experiments))
    throw Error('Unknown audio research manifest.');
  const seen=new Set();
  const scenes=manifest.experiments.map(scene=>{
    if(!scene.id||seen.has(scene.id)||!scene.question||!scene.a?.accession||!scene.b?.accession
      ||!Array.isArray(scene.turns)||scene.turns.length<2)
      throw Error('Incomplete or duplicate audio experiment.');
    seen.add(scene.id);
    if(scene.historicalRelationshipEstablished!==false||scene.institutionalVoice!==false
       ||scene.publicationApproval!=='not_approved')
      throw Error('Only unpublished, explicitly fictional scripts can enter local review.');
    return {
      id:scene.id,question:scene.question,tier:scene.tier,mode:scene.mode,
      a:{accession:scene.a.accession,title:scene.a.title},
      b:{accession:scene.b.accession,title:scene.b.title},
      rights:scene.rights,
      turns:scene.turns.map(turn=>{
        if(!['objectA','objectB','fictional_archivist'].includes(turn.voiceRole)
          ||!turn.id||typeof turn.text!=='string')
          throw Error('Unexpected voice role or missing script line.');
        return {id:turn.id,role:turn.voiceRole,text:turn.text};
      })
    };
  });
  if(!scenes.length||scenes.length>50)throw Error('Review dataset count must stay bounded.');
  return scenes;
}
export async function buildLocalAudioReview({out=DEFAULT_LISTENING_ROOM}={}){
  const destination=resolve(out);
  const rel=relative(scratch,destination);
  if(rel.startsWith('..')||isAbsolute(rel)||!rel||rel.includes('node_modules'))
    throw Error('Audio review must remain inside the ignored .local-research directory.');
  const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
  const scenes=safeAudioScenes(manifest);
  const template=await readFile(templatePath,'utf8');
  if(template.split('__SCENES__').length!==2)
    throw Error('Listening room template must have one data placeholder.');
  const safeJson=JSON.stringify(scenes).replace(/</g,'\\u003c').replace(/>/g,'\\u003e')
    .replace(/&/g,'\\u0026');
  const page=template.replace('__SCENES__',safeJson);
  await mkdir(dirname(destination),{recursive:true,mode:0o700});
  await writeFile(destination,page,{mode:0o600});
  return {file:destination,sceneCount:scenes.length,networkRequests:0,audioFilesCreated:0,
    visibility:'local_only_unpublished'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const r=await buildLocalAudioReview();
    console.log('Private A/B listening room: '+r.file);
    console.log(r.sceneCount+' scripted studies. Select audio files inside the browser; none are uploaded.');
  }catch(e){console.error('Audio review build failed: '+e.message);process.exitCode=1;}
}
