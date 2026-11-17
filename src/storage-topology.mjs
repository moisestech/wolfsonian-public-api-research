/**
 * SCHEMATIC virtual shelves for Archive Dreams.
 * Real public catalog identities remain UNLOCATED until an individually
 * verified and publication-approved location record exists.
 * DEMO boxes and DEMO accession labels are deliberately fictional.
 */
export const REAL_CATALOG_IDENTITIES=Object.freeze([
  {id:'XX1990.1484',title:'Sparton 558-C radio',kind:'public-identity'},
  {id:'86.17.1',title:'Trylon and Perisphere model',kind:'public-identity'},
  {id:'XM1999.108.8',title:'Machine Age Exposition catalogue',kind:'public-identity'},
  {id:'85.7.383a,b',title:'Mappemonde vase',kind:'public-identity'}
]);
export const SCHEMATIC_LEVELS=Object.freeze([
  {id:'DEMO-L1',label:'Illustrative Level 1',y:-44},
  {id:'DEMO-L2',label:'Illustrative Level 2',y:0},
  {id:'DEMO-L3',label:'Illustrative Level 3',y:44}
]);
export const SAMPLE_CONTAINERS=Object.freeze(
  SCHEMATIC_LEVELS.flatMap((level,li)=>
    ['A','B'].map((bay,bi)=>({
      id:'DEMO-BOX-'+String(li*2+bi+1).padStart(2,'0'),
      level:level.id, bay:'DEMO-BAY-'+bay,
      demoAccession:'FICTION-DEMO-'+String(li*2+bi+1).padStart(2,'0'),
      x:bi===0?-42:42,y:level.y+13,z:bi===0?-21:21,
      kind:'fictional-container',status:'ILLUSTRATIVE ONLY'
    }))
  )
);
export function buildStorageTopology({sample=true,approvedPlacements=[]}={}){
  const levels=SCHEMATIC_LEVELS.map(x=>({...x}));
  const identities=REAL_CATALOG_IDENTITIES.map(x=>({
    ...x,locationStatus:'UNKNOWN / NOT RELEASED',containerId:null,level:null,bay:null
  }));
  const containers=sample?SAMPLE_CONTAINERS.map(x=>({...x})):[];
  const links=containers.map(box=>({
    from:box.demoAccession,to:box.id,kind:'fictional_example',historical:false,
    source:'DEMONSTRATION DATA — NOT A MUSEUM RECORD'
  }));
  if(approvedPlacements.length){
    // This prototype contains NO authorized Annex geometry, box-field schema
    // or public storage location approvals. A string saying 'approved' cannot
    // convert illustrative DEMO floors into a factual museum floor plan.
    throw new Error('Real placements are disabled. Require a separate verified physical layout, source contract and publication clearance.');
  }
  return {
    sceneStatus:'SCHEMATIC MODEL — NOT A DIGITAL TWIN OR BUILDING PLAN',
    levels,containers,identities,links,
    statistics:{publicIdentities:identities.length,verifiedPlacements:identities.filter(x=>x.containerId).length,fictionalContainers:containers.length},
    notice:'All floor geometry and DEMO boxes are invented to explain a data model. The public accessions shown outside the cube have NO verified storage placement in this dataset.'
  };
}
export function inspectStorageNode(model,id){
  const box=model.containers.find(n=>n.id===id);
  if(box)return {title:box.id,kind:'fictional',description:'Illustrative box in '+box.level+' / '+box.bay+'. Paired ONLY with '+box.demoAccession+'. Not an actual Annex box.',source:'SIMULATED'};
  const item=model.identities.find(n=>n.id===id);
  if(item)return {title:item.title,kind:'catalog',description:'Accession '+item.id+'. Physical box, bay and floor: '+(item.containerId?(item.containerId+' / '+item.bay+' / '+item.level):'NOT ESTABLISHED OR NOT CLEARED FOR DISPLAY')+'.',source:item.locationStatus};
  return null;
}
