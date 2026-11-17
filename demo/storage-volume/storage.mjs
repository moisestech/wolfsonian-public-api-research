import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildStorageTopology, inspectStorageNode } from '/src/storage-topology.mjs';
import { INQUIRY_STAGES, objectInquiryDialogue, SOURCE_CREDIT } from '/src/object-inquiry.mjs';

const $=id=>document.getElementById(id);
const model=buildStorageTopology();
const state={selected:'XX1990.1484',level:'all',showBoxes:true,showIdentities:true};
const setText=(id,value)=>{$(id).textContent=String(value)};
const toList=(items,host,labeler)=>{
  for(const item of items){
    const button=document.createElement('button');
    button.type='button';button.dataset.id=item.id;
    const title=document.createElement('span');title.textContent=labeler(item);
    const sub=document.createElement('span');sub.className='sub';
    sub.textContent=item.kind==='fictional-container'?
      item.level+' / '+item.bay+' · FICTION': 'Accession '+item.id+' · LOCATION UNKNOWN';
    button.append(title,sub);
    button.addEventListener('click',()=>select(item.id));
    host.append(button);
  }
};
toList(model.identities,$('identity-list'),i=>i.title);
toList(model.containers,$('box-list'),i=>i.id+' · demonstration');
for(const stage of INQUIRY_STAGES){
  const option=document.createElement('option');option.value=stage.id;
  option.textContent=stage.label+' (questions '+stage.numbers[0]+'–'+stage.numbers.at(-1)+')';
  $('inquiry').append(option);
}
function displayPrompt(){
  const stage=INQUIRY_STAGES.find(s=>s.id===$('inquiry').value)||INQUIRY_STAGES[0];
  setText('inquiry-prompt',stage.prompt+' '+stage.examples[0]);
}
$('inquiry').addEventListener('change',displayPrompt);
displayPrompt();
function showDialogue(){
  const el=$('dialogue');el.replaceChildren();
  const study=objectInquiryDialogue(model.identities.find(i=>i.id===state.selected)||model.identities[0]);
  const pre=document.createElement('p');pre.textContent=study.disclaimer;el.append(pre);
  for(const turn of study.turns){
    const card=document.createElement('section');card.className='turn';card.dataset.type=turn.type;
    const name=document.createElement('strong');name.textContent=turn.speaker;
    const meta=document.createElement('small');meta.textContent=turn.phase.toUpperCase()+' · '+turn.type.toUpperCase().replaceAll('_',' ');
    const p=document.createElement('p');p.textContent=turn.text;
    card.append(name,meta,p);el.append(card);
  }
  const source=document.createElement('small');source.textContent=SOURCE_CREDIT;el.append(source);
}
$('dialogue-toggle').addEventListener('click',()=>{
  const wasHidden=$('dialogue').hidden;$('dialogue').hidden=!wasHidden;
  $('dialogue-toggle').setAttribute('aria-expanded',String(wasHidden));
  if(wasHidden){showDialogue();$('dialogue').scrollIntoView({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
});
function select(id){
  const detail=inspectStorageNode(model,id);if(!detail)return;
  state.selected=id;setText('selected-title',detail.title);setText('selected-detail',detail.description);
  setText('selected-source',detail.kind==='fictional'?'SYNTHETIC EXAMPLE · NO MUSEUM DATA':detail.source);
  document.querySelectorAll('[data-id]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));
  if(!$('dialogue').hidden)showDialogue();
}
select(state.selected);

const canvas=$('world'),host=$('render-host');
let renderer=null,scene=null,camera=null,orbit=null,stage=null,frame=0;
let boxGroup,identityGroup,activeSceneObjects=[];
function labelSprite(text,color='#e7f5ec'){
  const c=document.createElement('canvas');c.width=512;c.height=80;
  const ctx=c.getContext('2d');ctx.clearRect(0,0,512,80);
  ctx.fillStyle=color;ctx.textAlign='center';
  ctx.font='600 27px ui-monospace,monospace';ctx.fillText(text.slice(0,29),256,51);
  const texture=new THREE.CanvasTexture(c);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));
  sprite.scale.set(82,13,1);
  return sprite;
}
function nodeObject(shape,id){
  shape.traverse(obj=>{if(obj.isMesh)obj.userData.selectedId=id});
  activeSceneObjects.push(shape);
  return shape;
}
function create(){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
  renderer.setClearColor('#0d1715',1);
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(43,1,.1,1600);
  camera.position.set(275,195,315);
  orbit=new OrbitControls(camera,canvas);
  orbit.enableDamping=true;orbit.dampingFactor=.07;
  orbit.minDistance=160;orbit.maxDistance=740;
  orbit.target.set(25,0,0);
  scene.add(new THREE.AmbientLight('#ffffff',1.7));
  const lamp=new THREE.DirectionalLight('#ffffff',1.1);lamp.position.set(100,155,125);scene.add(lamp);
  stage=new THREE.Group();scene.add(stage);
  const edgeMaterial=new THREE.LineBasicMaterial({color:'#6b9185',transparent:true,opacity:.72});
  const frame=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(190,142,150)),edgeMaterial);
  frame.position.set(-22,0,0);stage.add(frame);
  const tick=new THREE.Group();stage.add(tick);
  model.levels.forEach(level=>{
    const deck=new THREE.Mesh(new THREE.BoxGeometry(185,2,147),
      new THREE.MeshBasicMaterial({color:'#416b60',transparent:true,opacity:.19,depthWrite:false,side:THREE.DoubleSide}));
    deck.position.set(-22,level.y-8,0);deck.userData.level=level.id;tick.add(deck);
    const outline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(185,2,147)),
      new THREE.LineBasicMaterial({color:'#81ac98',transparent:true,opacity:.7}));
    outline.position.copy(deck.position);outline.userData.level=level.id;tick.add(outline);
    const lbl=labelSprite(level.label.toUpperCase());lbl.position.set(-25,level.y+26,-87);lbl.userData.level=level.id;tick.add(lbl);
  });
  boxGroup=new THREE.Group();stage.add(boxGroup);
  for(const container of model.containers){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(38,19,31),
      new THREE.MeshStandardMaterial({color:'#ba845e',roughness:.82,metalness:.05}));
    mesh.position.set(container.x-22,container.y,container.z);
    mesh.userData.level=container.level;
    boxGroup.add(nodeObject(mesh,container.id));
    const line=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({color:'#f3d0a4'}));
    mesh.add(line);
    const l=labelSprite(container.id,'#fbcaa0');l.scale.set(57,9,1);l.position.set(0,17,0);mesh.add(l);
  }
  // Public identifiers deliberately float OUTSIDE the box, without lines to shelves.
  identityGroup=new THREE.Group();stage.add(identityGroup);
  model.identities.forEach((item,i)=>{
    const m=new THREE.Mesh(new THREE.SphereGeometry(7,18,12),
      new THREE.MeshStandardMaterial({color:'#64c9b0',emissive:'#186c61',emissiveIntensity:.5,metalness:.38,roughness:.28}));
    m.position.set(138,50-i*35,0);
    identityGroup.add(nodeObject(m,item.id));
    const l=labelSprite(item.id,'#c8f3e8');l.scale.set(72,11,1);l.position.set(0,18,0);m.add(l);
  });
  const unknown=labelSprite('UNLOCATED ACCESSIONS','#8bdbc4');
  unknown.position.set(138,93,0);identityGroup.add(unknown);
  const guide=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(110,147,110)),
     new THREE.LineDashedMaterial({color:'#3b7467',dashSize:5,gapSize:6}));
  guide.computeLineDistances();guide.position.set(138,0,0);stage.add(guide);
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let startPoint=null;
  canvas.addEventListener('pointerdown',e=>{startPoint={x:e.clientX,y:e.clientY}});
  canvas.addEventListener('pointerup',e=>{
    if(startPoint&&Math.hypot(e.clientX-startPoint.x,e.clientY-startPoint.y)<7){
      const bounds=canvas.getBoundingClientRect();
      pointer.x=((e.clientX-bounds.left)/bounds.width)*2-1;
      pointer.y=-((e.clientY-bounds.top)/bounds.height)*2+1;
      ray.setFromCamera(pointer,camera);
      const hit=ray.intersectObjects(activeSceneObjects.filter(x=>x.visible),true)
        .find(h=>h.object.userData.selectedId);
      if(hit)select(hit.object.userData.selectedId);
    }
    startPoint=null;
  });
  const resize=()=>{
    const rect=host.getBoundingClientRect();
    camera.aspect=Math.max(1,rect.width)/Math.max(1,rect.height);
    camera.updateProjectionMatrix();renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);
  };
  new ResizeObserver(resize).observe(host);resize();
  const draw=()=>{frame=requestAnimationFrame(draw);orbit.update();renderer.render(scene,camera)};
  draw();
  setText('render-status','ILLUSTRATIVE 3 LEVELS · '+model.containers.length+' FICTIONAL BOXES · '+model.identities.length+' REAL ACCESSION IDENTITIES UNLOCATED');
}
function refresh(){
  if(!stage)return;
  boxGroup.visible=state.showBoxes;
  identityGroup.visible=state.showIdentities;
  stage.traverse(obj=>{
    if(!obj.userData?.level)return;
    obj.visible=state.level==='all'||obj.userData.level===state.level;
  });
  if(state.level!=='all')orbit.target.y=model.levels.find(l=>l.id===state.level)?.y||0;
  else orbit.target.y=0;
}
$('show-boxes').addEventListener('change',e=>{state.showBoxes=e.target.checked;refresh()});
$('show-identities').addEventListener('change',e=>{state.showIdentities=e.target.checked;refresh()});
$('level').addEventListener('change',e=>{state.level=e.target.value;refresh()});
$('reset').addEventListener('click',()=>{state.level='all';$('level').value='all';if(camera&&orbit){camera.position.set(275,195,315);orbit.target.set(25,0,0);orbit.update();}refresh()});
try{create()}catch(error){
  renderer?.dispose();cancelAnimationFrame(frame);
  const note='WebGL unavailable here; the two accessible lists and inquiry prompts remain usable.';
  setText('render-status',note);
  canvas.hidden=true;
}
