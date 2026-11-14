import { PUBLIC_ANCHORS, applyLayers, buildAtlasGraph } from '/src/atlas-graph.mjs';
import { SCRIPTED_SCENES, sceneForObject } from '/src/atlas-scripts.mjs';

const $ = id => document.getElementById(id);
const graph = buildAtlasGraph({ objects: PUBLIC_ANCHORS, authorizedBoxMappings: [] });
const positions = PUBLIC_ANCHORS.map((object, index) => ({
  id: object.id,
  x: 120 + (index % 3) * 240,
  y: 120 + Math.floor(index / 3) * 180,
}));

function layers() {
  return applyLayers(graph, { accession: $('layer-accession').checked, box: $('layer-box').checked });
}

function drawFallback(view) {
  const svg = $('map');
  svg.replaceChildren();
  const ns = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, text) => {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text) node.textContent = text;
    return node;
  };
  for (const edge of view.relationships) {
    const object = PUBLIC_ANCHORS.find(item => item.id === edge.source);
    const place = positions.find(item => item.id === object?.id);
    if (!place) continue;
    svg.append(el('line', { x1: place.x, y1: place.y, x2: place.x + 70, y2: place.y - 36, stroke: '#326d68', 'stroke-width': 2 }));
  }
  for (const place of positions) {
    const object = PUBLIC_ANCHORS.find(item => item.id === place.id);
    const group = el('g', { tabindex: 0, role: 'button', 'aria-label': object.title });
    group.append(el('rect', { x: place.x - 90, y: place.y - 28, width: 180, height: 64, rx: 6, fill: '#f6f4eb', stroke: '#142523' }));
    group.append(el('text', { x: place.x, y: place.y - 4, 'text-anchor': 'middle', 'font-size': 12, fill: '#142523' }, object.accession));
    group.append(el('text', { x: place.x, y: place.y + 16, 'text-anchor': 'middle', 'font-size': 11, fill: '#326d68' }, object.title.slice(0, 28)));
    group.addEventListener('click', () => show(object));
    group.addEventListener('keydown', event => { if (event.key === 'Enter') show(object); });
    svg.append(group);
  }
}

function showScene(scene, object) {
  const box = $('evidence');
  box.replaceChildren();
  const title = document.createElement('h2');
  title.textContent = object ? object.title : scene.title;
  const meta = document.createElement('p');
  meta.textContent = object ? object.accession + ' · ' + object.sourceState : scene.disclaimer;
  box.append(title, meta);
  if (!scene) {
    const note = document.createElement('p');
    note.textContent = 'No scripted scene is attached to this packet. The public record remains the evidence.';
    box.append(note);
    return;
  }
  if (object) {
    const note = document.createElement('p');
    note.textContent = scene.disclaimer;
    box.append(note);
  }
  const list = document.createElement('ol');
  for (const turn of scene.turns) {
    const item = document.createElement('li');
    item.textContent = turn.speaker + ' · ' + turn.knowledgeStatus + ' — ' + turn.text;
    list.append(item);
  }
  const question = document.createElement('p');
  question.textContent = scene.unansweredQuestion;
  box.append(list, question);
}

function show(object) {
  showScene(sceneForObject(object.id), object);
}

function paint() {
  const view = layers();
  $('notice').textContent = view.boxNotice || 'Accession lines name catalog identity. They do not establish that two objects share a history.';
  drawFallback(view);
  return view;
}

async function tryWebGL(view) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = $('webgl');
  if (reduced) {
    $('mode').textContent = '2D atlas · reduced motion';
    canvas.hidden = true;
    return;
  }
  try {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    const width = canvas.parentElement.clientWidth || 750;
    renderer.setSize(width, 460, false);
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / 460, 0.1, 20);
    camera.position.set(0, 1.4, 4.2);
    camera.lookAt(0, 0, 0);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), new THREE.MeshBasicMaterial({ color: '#f6f4eb' }));
    floor.rotation.x = -Math.PI / 2.4;
    scene.add(floor);
    PUBLIC_ANCHORS.forEach((object, index) => {
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.08), new THREE.MeshBasicMaterial({ color: index === 0 ? '#ae6243' : '#326d68' }));
      marker.position.set((index % 3) - 1, 0.2, Math.floor(index / 3) * 0.7 - 0.3);
      marker.userData.object = object;
      scene.add(marker);
    });
    renderer.render(scene, camera);
    canvas.hidden = false;
    $('mode').textContent = 'WebGL room behind the 2D packets. ' + view.relationships.length + ' accession lines. No museum photograph is loaded.';
  } catch (error) {
    canvas.hidden = true;
    $('mode').textContent = '2D atlas · ' + error.message;
  }
}

for (const id of ['layer-accession', 'layer-box']) $(id).addEventListener('change', () => tryWebGL(paint()));
const view = paint();
tryWebGL(view);
show(PUBLIC_ANCHORS[0]);
for (const scene of SCRIPTED_SCENES) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = scene.title;
  button.addEventListener('click', () => showScene(scene));
  document.querySelector('.controls').append(button);
}
