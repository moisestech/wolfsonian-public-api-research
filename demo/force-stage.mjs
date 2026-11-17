import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import ThreeForceGraph from 'three-forcegraph';
import { fittedSize } from '../src/sprite-fit.mjs';

const PLACEHOLDER = '/demo/archive-society/assets/object-placeholder.png';
const FIT_DISTANCE = 240;

const loader = new THREE.TextureLoader();
const textures = new Map();

function rememberAspect(texture) {
  const image = texture.image;
  if (image?.width && image?.height) texture.userData.aspect = image.width / image.height;
}

function textureFor(url) {
  const key = url || PLACEHOLDER;
  if (!textures.has(key)) {
    const texture = loader.load(key, rememberAspect);
    texture.colorSpace = THREE.SRGBColorSpace;
    rememberAspect(texture);
    textures.set(key, texture);
  }
  return textures.get(key);
}

function nodeIdOf(object) {
  let current = object;
  while (current) {
    if (current.userData?.id) return current.userData.id;
    current = current.parent;
  }
  return '';
}

export function mountForceStage(host, { onSelect, background = '#111111', linkFocus = '#f4f4f4', linkIdle = '#6e6e6e' } = {}) {
  host.replaceChildren();
  host.classList.add('force-stage');
  const canvas = document.createElement('canvas');
  canvas.className = 'force-canvas';
  const list = document.createElement('div');
  list.className = 'graph-list';
  host.append(canvas, list);
  host.dataset.scale = '1';
  host.dataset.speaking = '';
  host.dataset.activeSpeaker = '';
  host.dataset.activeRole = '';

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 4000);
  camera.position.set(0, 0, FIT_DISTANCE);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.minDistance = 48;
  controls.maxDistance = 900;
  const linkMaterials = new Map();
  function paintFor(link) {
    return link.color || (link.focused ? linkFocus : linkIdle);
  }
  function materialFor(link) {
    const color = paintFor(link);
    const key = color + (link.focused ? ':focus' : ':idle');
    if (!linkMaterials.has(key)) {
      linkMaterials.set(key, new THREE.MeshBasicMaterial({
        color,
        transparent: !link.focused,
        opacity: link.focused ? 1 : 0.9,
      }));
    }
    return linkMaterials.get(key);
  }
  const graph = new ThreeForceGraph()
    .nodeThreeObjectExtend(false)
    .linkOpacity(1)
    .linkWidth(link => link.focused ? 5.2 : 2.1)
    .linkColor(paintFor)
    .linkMaterial(materialFor)
    .nodeThreeObject(node => spriteFor(node));
  const charge = graph.d3Force('charge');
  if (charge) charge.strength(-120);
  scene.add(graph);
  scene.add(new THREE.AmbientLight(0xffffff, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(30, 80, 140);
  scene.add(key);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let speakingId = '';
  let activeSpeakerId = '';
  let activeRole = '';
  let pairSource = '';
  let pairTarget = '';
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const signal = new THREE.Mesh(
    new THREE.SphereGeometry(2.1, 12, 8),
    new THREE.MeshBasicMaterial({ color: '#f4f4f4', transparent: true, opacity: 0.96 })
  );
  signal.visible=false;
  scene.add(signal);
  let distance = FIT_DISTANCE;
  let pointerDown = null;

  function spriteFor(node) {
    const group = new THREE.Group();
    group.userData.id = node.id;
    const photo = typeof node.image === 'string' && node.image.length > 0;
    const material = new THREE.SpriteMaterial({
      map: textureFor(photo ? node.image : PLACEHOLDER),
      color: photo ? '#ffffff' : (node.color || '#f4f4f4'),
      transparent: true,
    });
    const sprite = new THREE.Sprite(material);
    const [fitW, fitH] = fittedSize(material.map);
    sprite.scale.set(fitW, fitH, 1);
    const accent = node.accent || '';
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(node.focused ? 12.2 : 12.6, node.focused ? 15.4 : 13.8, 48),
      new THREE.MeshBasicMaterial({ color: accent || node.color || '#f4f4f4', transparent: true, opacity: node.focused ? 0.95 : accent ? 0.72 : 0.14, side: THREE.DoubleSide })
    );
    group.add(sprite, ring);
    group.userData.sprite = sprite;
    group.userData.ring = ring;
    return group;
  }

  function applyDistance(next) {
    distance = Math.min(900, Math.max(48, next));
    const offset = camera.position.clone().sub(controls.target);
    if (offset.lengthSq() < 1e-6) offset.set(0, 0, 1);
    offset.setLength(distance);
    camera.position.copy(controls.target).add(offset);
    host.dataset.scale = String(Math.round((FIT_DISTANCE / distance) * 1000) / 1000);
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function setGraph(nodes, links) {
    const previous = new Map((graph.graphData().nodes || []).map(node => [node.id, node]));
    const accent = new Map();
    for (const link of [...links.filter(item => !item.focused), ...links.filter(item => item.focused)]) {
      if (!link.color) continue;
      const source = typeof link.source === 'string' ? link.source : link.source?.id;
      const target = typeof link.target === 'string' ? link.target : link.target?.id;
      if (source) accent.set(source, link.color);
      if (target) accent.set(target, link.color);
    }
    const nextNodes = nodes.map(node => {
      const painted = { ...node, accent: accent.get(node.id) || '' };
      const prior = previous.get(node.id);
      if (!prior) return { ...painted, fx: undefined, fy: undefined, fz: undefined };
      return Object.assign(prior, painted, { fx: undefined, fy: undefined, fz: undefined });
    });
    graph.graphData({ nodes: nextNodes, links: links.map(link => ({ ...link })) });
    const chargeForce = graph.d3Force('charge');
    if (chargeForce) chargeForce.strength(nextNodes.length > 40 ? -34 : -140);
    const linkForce = graph.d3Force('link');
    if (linkForce) linkForce.distance(link => link.focused ? 36 : 84);
    list.replaceChildren();
    for (const node of nextNodes) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'graph-node' + (node.neighbor ? ' conversation-edge' : '') + (node.emphasized ? ' emphasized' : '') + (node.focused ? ' selected' : '');
      button.dataset.accession = node.id;
      button.textContent = node.label || node.id;
      button.addEventListener('click', () => onSelect?.(node.id));
      if (typeof node.image === 'string' && node.image.startsWith('blob:')) {
        const image = document.createElement('img');
        image.className = 'thumbnail';
        image.alt = '';
        image.src = node.image;
        button.append(image);
      }
      list.append(button);
    }
    graph.d3ReheatSimulation();
  }

  function focusPair(sourceId, targetId) {
    for (const node of graph.graphData().nodes || []) {
      if (node.id === sourceId) { node.fx = -18; node.fy = 0; node.fz = 0; }
      else if (node.id === targetId) { node.fx = 18; node.fy = 0; node.fz = 0; }
      else { node.fx = undefined; node.fy = undefined; node.fz = undefined; }
    }
    graph.d3ReheatSimulation();
    pairSource=sourceId;pairTarget=targetId;
    host.dataset.pair = sourceId + '|' + targetId;
  }

  function setSpeaking(nodeId) {
    speakingId = nodeId || '';
    host.dataset.speaking = speakingId;
  }

  function setActiveSpeaker(nodeId,role='') {
    activeSpeakerId=nodeId||'';
    activeRole=role||'';
    host.dataset.activeSpeaker=activeSpeakerId;
    host.dataset.activeRole=activeRole;
    list.querySelectorAll('.graph-node').forEach(button=>{
      const isCurrent=button.dataset.accession===activeSpeakerId;
      button.classList.toggle('current-speaker',isCurrent);
      if(isCurrent)button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
    });
  }

  function pulse() {
    const time = performance.now() / 1000;
    const reduced=Boolean(reduceMotion?.matches);
    const nodes=graph.graphData().nodes||[];
    const source=nodes.find(node=>node.id===pairSource);
    const target=nodes.find(node=>node.id===pairTarget);
    const speakerId=speakingId||activeSpeakerId;
    const forward=speakerId===pairSource,reverse=speakerId===pairTarget;
    const hasCoordinates=source&&target&&[source.x,source.y,source.z,target.x,target.y,target.z].every(Number.isFinite);
    signal.visible=Boolean(hasCoordinates&&(forward||reverse||activeRole==='archivist'));
    if(signal.visible){
      const start=forward?source:reverse?target:source;
      const end=forward?target:reverse?source:target;
      const fraction=reduced||activeRole==='archivist'?.5:(time*.43%1);
      signal.position.set(
        start.x+(end.x-start.x)*fraction,
        start.y+(end.y-start.y)*fraction,
        start.z+(end.z-start.z)*fraction
      );
      signal.material.color.set(activeRole==='archivist'?'#9ed9b4':forward?'#9cc7ff':'#ffc089');
      signal.scale.setScalar(reduced?0.85:1);
    }
    for (const node of nodes) {
      const group = node.__threeObj;
      const sprite = group?.userData?.sprite;
      const ring = group?.userData?.ring;
      if (!sprite || !ring) continue;
      const speaking = node.id === speakingId;
      const active = node.id === activeSpeakerId;
      const scale = speaking && !reduced ? 1 + Math.sin(time * 7) * 0.1 : active ? 1.12 : 1;
      const [fitW, fitH] = fittedSize(sprite.material.map);
      sprite.scale.set(fitW * scale, fitH * scale, 1);
      if (speaking) host.dataset.pulse = String(Math.round(scale * 100) / 100);
      ring.material.color.set(active||speaking
        ?node.id===pairSource?'#9cc7ff':'#ffc089'
        :node.accent||node.color||'#f4f4f');
      ring.material.opacity = speaking||active ? 1 : node.focused ? 0.72 : node.accent ? 0.44 : 0.13;
      const outer = ring.geometry.parameters.outerRadius || 13.8;
      const pad = (node.focused ? 1.22 : 1.14) * scale;
      ring.scale.set((fitW / 2) * pad / outer, (fitH / 2) * pad / outer, 1);
      ring.lookAt(camera.position);
    }
  }

  canvas.addEventListener('pointerdown', event => { pointerDown = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener('pointerup', event => {
    if (!pointerDown || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 5) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(graph.children, true).map(item => nodeIdOf(item.object)).find(Boolean);
    if (hit) onSelect?.(hit);
  });

  const observer = new ResizeObserver(() => resize());
  observer.observe(host);
  resize();

  function frame() {
    graph.tickFrame();
    pulse();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    setGraph,
    focusPair,
    setSpeaking,
    setActiveSpeaker,
    resize,
    zoom(factor) { applyDistance(camera.position.distanceTo(controls.target) / factor); },
    fit() { controls.target.set(0, 0, 0); applyDistance(FIT_DISTANCE); },
    setZoomT(t) {
      const clamped = Math.min(100, Math.max(0, Number(t) || 0));
      controls.target.set(0, 0, 0);
      applyDistance(FIT_DISTANCE * Math.pow(48 / FIT_DISTANCE, clamped / 100));
    },
    scale() { return Number(host.dataset.scale); },
  };
}
