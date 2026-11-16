import { PUBLIC_ANCHORS } from '/src/atlas-graph.mjs';
import { makeForceAtlasGraph } from '/src/force-atlas-data.mjs';

const $ = id => document.getElementById(id);
const CANONICAL = 'https://cdn.jsdelivr.net/npm/three-forcegraph@1.43.6/dist/three-forcegraph.min.js';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = { seed:'XX1990.1484', showAccession:true, showQuestions:true, showBox:false };
const canvas = $('graph'), host = $('canvas-host');
const seed = $('seed');
for (const object of PUBLIC_ANCHORS) {
  const opt = document.createElement('option');
  opt.value = object.accession;
  opt.textContent = object.title + ' · ' + object.accession;
  seed.append(opt);
}
seed.value = state.seed;
let THREE, renderer, scene, camera, raycaster, force, rendered, fallbackGroup, frameId, resizeObserver;
let azimuth = 0.45, elevation = 0.24, distance = 235;
let drag = null;
const nodeById = () => new Map(rendered.nodes.map(n=>[n.id,n]));
const asId = val => typeof val === 'object' && val ? val.id : val;

function showRecord() {
  const node = rendered.nodes.find(n => n.id === rendered.selectedId);
  $('inspector-heading').textContent = node?.label || 'Select an object';
  const box = $('inspector'); box.replaceChildren();
  if (!node) return;
  const detail = document.createElement('dl');
  function datum(term, value) {
    const dt = document.createElement('dt'); dt.textContent = term;
    const dd = document.createElement('dd'); dd.textContent = value;
    detail.append(dt, dd);
  }
  datum('Accession', node.accession);
  datum('Evidence status', node.sourceState + ' — not a Lakehouse live match');
  datum('Graph role', 'Public-packet object / query anchor');
  box.append(detail);
  const heading = document.createElement('h3');
  heading.textContent = 'What can we ask about this object?';
  box.append(heading);
  const adjoining = rendered.links.filter(l => asId(l.source)===node.id || asId(l.target)===node.id);
  if (!adjoining.length) {
    const p=document.createElement('p');p.textContent='No visible links in the selected layers. This is not a historical no-match.';box.append(p);
  }
  const byId=nodeById();
  for (const edge of adjoining) {
    const otherId=asId(edge.source)===node.id?asId(edge.target):asId(edge.source);
    const target=byId.get(otherId);
    const div=document.createElement('div');div.className=edge.layer==='interpretation'?'question':'identity';
    const p=document.createElement('p');
    p.textContent=edge.layer==='interpretation'?
      'ARTIST QUESTION · '+edge.question :
      edge.layer==='box' ? 'DOCUMENTED BOX ASSOCIATION · '+edge.basis :
      'CATALOG IDENTITY · '+edge.basis;
    div.append(p);
    if (target) {
      const btn=document.createElement('button');btn.type='button';
      btn.textContent='Inspect '+target.label;
      btn.addEventListener('click',()=>selectNode(target));
      div.append(btn);
    }
    box.append(div);
  }
}
function selectNode(node) {
  if (!node) return;
  const object = node.kind === 'object' ? node :
    rendered.nodes.find(n=>n.kind==='object' && n.accession === node.accession);
  if (!object) return;
  state.seed=object.accession;seed.value=state.seed;
  rendered.selectedId=object.id;
  showRecord();
}
function updateControls() {
  rendered=makeForceAtlasGraph({
    selectedAccession:state.seed,showAccession:state.showAccession,
    showQuestions:state.showQuestions,showBox:state.showBox
  });
  $('status').textContent=rendered.stats.objects+' public-packet objects · '+
    rendered.stats.identities+' identity links · '+rendered.stats.questions+
    ' artist questions · '+rendered.stats.boxes+' box links';
  $('box-notice').textContent=rendered.boxNotice || '';
  showRecord();
}
function labelSprite(node) {
  const sheet=document.createElement('canvas');
  sheet.width=512;sheet.height=112;
  const ctx=sheet.getContext('2d');
  ctx.font='bold 26px system-ui, sans-serif';ctx.textAlign='center';
  ctx.fillStyle='#142523';
  const short=node.label.length>31?node.label.slice(0,30)+'…':node.label;
  ctx.fillText(short,256,42);
  ctx.font='21px ui-monospace, monospace';ctx.fillStyle='#3e625c';
  ctx.fillText(node.accession || node.kind.toUpperCase(),256,76);
  const texture=new THREE.CanvasTexture(sheet);
  const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false});
  const sprite=new THREE.Sprite(material);
  sprite.scale.set(54,11.8,1);sprite.position.set(0,12,0);
  sprite.userData.nodeId=node.id;
  return sprite;
}
function nodeObject(node) {
  const group=new THREE.Group();group.userData.nodeId=node.id;
  const radius=node.kind==='object'?(node.selected?5.8:4.8):2.2;
  const material=new THREE.MeshStandardMaterial({
    color:node.color,metalness:0.2,roughness:0.55
  });
  const sphere=new THREE.Mesh(new THREE.IcosahedronGeometry(radius,2),material);
  sphere.userData.nodeId=node.id;
  group.add(sphere,labelSprite(node));
  return group;
}
function clearGraph() {
  if(force){scene.remove(force);force=null;}
  if(fallbackGroup){scene.remove(fallbackGroup);fallbackGroup=null;}
}
function staticGraph() {
  fallbackGroup=new THREE.Group();
  const byId=nodeById();
  for (const edge of rendered.links) {
    const a=byId.get(asId(edge.source)),b=byId.get(asId(edge.target));
    if (!a || !b) continue;
    const geo=new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(a.x,a.y,a.z),new THREE.Vector3(b.x,b.y,b.z)
    ]);
    const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:edge.color,transparent:true,opacity:.72}));
    fallbackGroup.add(line);
  }
  for (const node of rendered.nodes) {
    const group=nodeObject(node);
    group.position.set(node.x,node.y,node.z);
    fallbackGroup.add(group);
  }
  scene.add(fallbackGroup);
}
function graphView() {
  clearGraph();
  if (typeof window.ThreeForceGraph !== 'function') {
    staticGraph();
    $('render-mode').textContent='Offline 3D positions · force simulation unavailable';
    return;
  }
  try {
    force=new window.ThreeForceGraph()
      .nodeThreeObject(nodeObject)
      .linkColor(l=>l.color)
      .linkOpacity(.58)
      .linkWidth(.3)
      .graphData({
        nodes:rendered.nodes.map(n=>({...n})),
        links:rendered.links.map(l=>({...l}))
      });
    scene.add(force);
    $('render-mode').textContent='Force simulation · 3D · artist questions, not historical edges';
  }catch(error) {
    console.warn('Force layout could not load; using static Three.js graph.',error);
    if (force){scene.remove(force);force=null;}
    staticGraph();
    $('render-mode').textContent='Static 3D fallback · evidence layers preserved';
  }
}
function cameraPosition() {
  elevation=Math.max(-1.12,Math.min(1.12,elevation));
  distance=Math.max(100,Math.min(480,distance));
  camera.position.set(
    Math.sin(azimuth)*Math.cos(elevation)*distance,
    Math.sin(elevation)*distance,
    Math.cos(azimuth)*Math.cos(elevation)*distance
  );
  camera.lookAt(0,0,0);
}
function pick(clientX,clientY){
  const rect=canvas.getBoundingClientRect();
  const p=new THREE.Vector2((clientX-rect.left)/rect.width*2-1,-((clientY-rect.top)/rect.height*2-1));
  raycaster.setFromCamera(p,camera);
  const collisions=raycaster.intersectObjects(force?[force]:[fallbackGroup],true);
  for (const hit of collisions) {
    let entity=hit.object;
    while(entity && !entity.userData.nodeId) entity=entity.parent;
    const node=rendered.nodes.find(n=>n.id===entity?.userData.nodeId);
    if(node){selectNode(node);return;}
  }
}
function resize() {
  const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
function initializeScene() {
  renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true,powerPreference:'low-power'});
  renderer.setClearColor('#eeeee8');
  renderer.setPixelRatio(Math.min(1.5,devicePixelRatio||1));
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(46,1,.1,1000);
  raycaster=new THREE.Raycaster();
  scene.add(new THREE.AmbientLight(0xffffff,2.15));
  const light=new THREE.DirectionalLight(0xffffff,2);
  light.position.set(45,100,95);scene.add(light);
  cameraPosition();resize();
  resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  canvas.addEventListener('pointerdown',e=>{
    drag={x:e.clientX,y:e.clientY,azimuth,elevation,distance,at:performance.now()};
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drag)return;
    azimuth=drag.azimuth+(e.clientX-drag.x)*.006;
    elevation=drag.elevation+(e.clientY-drag.y)*.005;
    cameraPosition();
  });
  canvas.addEventListener('pointerup',e=>{
    if(drag && Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<7)pick(e.clientX,e.clientY);
    drag=null;
  });
  canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('wheel',e=>{
    e.preventDefault();distance*=Math.exp(e.deltaY*.0009);cameraPosition();
  },{passive:false});
  let frames=0;
  function animate(){
    frameId=requestAnimationFrame(animate);
    if(document.hidden)return;
    // Continue until settled; freeze on reduced-motion devices.
    if(force && (!reduced || frames<160)) {
      force.tickFrame();
      frames++;
    }
    renderer.render(scene,camera);
  }
  animate();
}
function loadForceScript(){
  return new Promise(resolve=>{
    if(typeof window.ThreeForceGraph==='function')return resolve(true);
    const s=document.createElement('script');
    s.src=CANONICAL;s.async=true;s.crossOrigin='anonymous';
    const timer=setTimeout(()=>resolve(false),3600);
    s.onload=()=>{clearTimeout(timer);resolve(typeof window.ThreeForceGraph==='function');};
    s.onerror=()=>{clearTimeout(timer);resolve(false);};
    document.head.append(s);
  });
}
function bind() {
  $('zoom-in').addEventListener('click',()=>{distance*=0.80;cameraPosition();});
  $('zoom-out').addEventListener('click',()=>{distance*=1.25;cameraPosition();});
  seed.addEventListener('change',()=>{state.seed=seed.value;updateControls();graphView();});
  for(const [id,key] of [['accession','showAccession'],['questions','showQuestions'],['box','showBox']]){
    $(id).addEventListener('change',()=>{state[key]=$(id).checked;updateControls();graphView();});
  }
  $('reset').addEventListener('click',()=>{
    azimuth=.45;elevation=.24;distance=235;cameraPosition();
    state.seed='XX1990.1484';seed.value=state.seed;
    updateControls();graphView();
  });
  window.addEventListener('pagehide',()=>{
    cancelAnimationFrame(frameId);
    resizeObserver?.disconnect();
    renderer?.dispose();
  },{once:true});
}
async function start() {
  updateControls();
  try{
    THREE=await import('/node_modules/three/build/three.module.js');
    initializeScene();bind();
    graphView(); // First render works offline before the optional force package loads.
    if(await loadForceScript())graphView();
  }catch(error) {
    console.error('Local WebGL unavailable; open 2D atlas.',error);
    $('render-mode').textContent='WebGL unavailable. Use the linked 2D Spatial Atlas.';
    $('canvas-host').classList.add('unavailable');
    bindFallback();
  }
}
function bindFallback(){
  seed.addEventListener('change',()=>{state.seed=seed.value;updateControls();});
  for(const [id,key] of [['accession','showAccession'],['questions','showQuestions'],['box','showBox']])
    $(id).addEventListener('change',()=>{state[key]=$(id).checked;updateControls();});
}
start();
