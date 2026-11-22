import {readFile,readdir} from 'node:fs/promises';
import {MATRIX_OBJECTS} from '../src/public-matrix-objects.mjs';
import {matrixToRecords} from '../src/matrix-room.mjs';
import {CURATED_EDGE_SCENES as scenes} from '../src/curated-edge-scenes.mjs';
import {CURATORIAL_PATHS as paths} from '../src/curatorial-relationships.mjs';
import {WORLDS_FAIRS_RESEARCH} from '../src/worlds-fairs-research.mjs';
import {OBJECT_VOICE_DIRECTIONS} from '../src/object-voice-directions.mjs';
import {notebookProductionManifest,productionAnalytics,sourceResearchQueue} from '../src/notebooklm-production.mjs';
import {conversationFor} from '../src/archive-society.mjs';
import {conversationEpisode} from '../src/conversation-orientation.mjs';
const records=matrixToRecords(MATRIX_OBJECTS);
// The public cast omits the aircraft from the small directory; use its published authored label only.
for(const direction of OBJECT_VOICE_DIRECTIONS)if(!records.some(r=>r.accession===direction.accession))records.push({accession:direction.accession,title:direction.label});
const publicSources=[];
for(const file of await readdir(new URL('../data/public/objects/',import.meta.url))){
  if(!file.endsWith('.json'))continue;
  const p=JSON.parse(await readFile(new URL('../data/public/objects/'+file,import.meta.url),'utf8'));
  publicSources.push({accession:p.accessionNumber,title:p.title,date:p.date,urls:p.source_urls});
}
for(const c of WORLDS_FAIRS_RESEARCH.candidates)publicSources.push({accession:c.accession,title:c.title,date:c.year,urls:[c.publicSource]});
const displayQuestions=Object.fromEntries(scenes.map(s=>{
  const source=records.find(r=>r.accession===s.a),target=records.find(r=>r.accession===s.b);
  const conversation=conversationFor(source,target,{id:s.id,reasons:[{family:s.requires.family,value:s.requires.value}]});
  return [s.id,conversationEpisode({source,target,conversation}).question];
}));
const manifest=notebookProductionManifest({scenes,paths,records,publicSources,displayQuestions});
console.log(JSON.stringify({sourceCommit:process.env.ARCHIVE_EDITORIAL_SOURCE_COMMIT||null,analytics:productionAnalytics(manifest),sourceResearchQueue:sourceResearchQueue(manifest),manifest},null,2));
