// Count playable relationships in the default public directory, once per pair.
import { MATRIX_OBJECTS } from '../src/public-matrix-objects.mjs';
import { matrixToRecords } from '../src/matrix-room.mjs';
import { societyView, conversationFor } from '../src/archive-society.mjs';
import { CURATORIAL_PATHS } from '../src/curatorial-relationships.mjs';

const records=matrixToRecords(MATRIX_OBJECTS);
const byId=new Map(records.map(record=>[record.accession,record]));
const neighbors=new Map();
function connect(a,b){
  for(const [source,target] of [[a,b],[b,a]]){
    if(!neighbors.has(source))neighbors.set(source,new Set());
    neighbors.get(source).add(target);
  }
}
for(const source of records){
  for(const edge of societyView(records,source.accession).edges){
    const target=byId.get(edge.target);
    if(conversationFor(source,target,edge).mode==='CURATED_EDGE_SCENE')connect(source.accession,target.accession);
  }
}
for(const path of CURATORIAL_PATHS)connect(path.source.accession,path.target.accession);
const visited=new Set(), groups=[];
for(const accession of neighbors.keys()){
  if(visited.has(accession))continue;
  const group=new Set([accession]);
  for(const id of group){
    visited.add(id);
    for(const neighbor of neighbors.get(id))group.add(neighbor);
  }
  groups.push([...group].sort());
}
groups.sort((a,b)=>b.length-a.length);
const degrees=[...neighbors.values()].map(set=>set.size);
console.log(JSON.stringify({
  playablePairs:degrees.reduce((sum,degree)=>sum+degree,0)/2,
  speakingObjects:degrees.length,
  singleConversationObjects:degrees.filter(degree=>degree===1).length,
  connectedGroupSizes:groups.map(group=>group.length),
  connectedGroups:groups
},null,2));
