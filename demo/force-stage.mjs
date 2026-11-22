import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import ThreeForceGraph from 'three-forcegraph';
import { fittedSize, frameBars } from '../src/sprite-fit.mjs';
import { nearestZoomStop } from '../src/zoom-stops.mjs';
import { createDreamField } from './archive-society/dream-field.mjs';

const PLACEHOLDER = '/demo/archive-society/assets/object-placeholder.png';
const FAR = 640;
const NEAR = 28;

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

export function mountForceStage(host, { onSelect, onLink, onDrag, background = '#111111', dream = false, linkFocus = '#f4f4f4', linkIdle = '#6e6e6e' } = {}) {
  host.replaceChildren();
  host.classList.add('force-stage');
  const canvas = document.createElement('canvas');
  canvas.className = 'force-canvas';
  const list = document.createElement('div');
  list.className = 'graph-list';
  host.append(canvas, list);
  host.dataset.scale = '1';
  host.dataset.zoom = '0';
  host.dataset.scope = 'world';
  host.dataset.speaking = '';

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 4000);
  camera.position.set(0, 0, FAR);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.minDistance = 24;
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
  const dreamField = dream ? createDreamField() : null;
  if (dreamField) scene.add(dreamField.mesh);
  scene.add(new THREE.AmbientLight(0xffffff, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(30, 80, 140);
  scene.add(key);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let speakingId = '';
  let pointingId = '';
  let pairHighlight = null;
  let cluster = null;
  let distance = FAR;
  let pointerDown = null;

  function spriteFor(node) {
    const group = new THREE.Group();
    group.userData.id = node.id;
    const photo = typeof node.image === 'string' && node.image.length > 0;
    const icon = !photo && typeof node.icon === 'string' && node.icon.length > 0 ? node.icon : '';
    const material = new THREE.SpriteMaterial({
      map: textureFor(photo ? node.image : (icon || PLACEHOLDER)),
      color: '#ffffff',
      transparent: true,
    });
    const sprite = new THREE.Sprite(material);
    const [fitW, fitH] = fittedSize(material.map);
    sprite.scale.set(fitW, fitH, 1);
    const accent = node.accent || '';
    const frame = new THREE.Group();
    const frameMaterial = new THREE.MeshBasicMaterial({
      color: accent || node.color || '#f4f4f4',
      transparent: true,
      opacity: node.focused ? 0.95 : accent ? 0.72 : 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    for (const bar of frameBars(fitW, fitH, { focused: Boolean(node.focused) })) {
      const piece = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), frameMaterial);
      piece.scale.set(bar.w, bar.h, 1);
      piece.position.set(bar.x, bar.y, 0.2);
      frame.add(piece);
    }
    group.add(sprite, frame);
    group.userData.sprite = sprite;
    group.userData.frame = frame;
    return group;
  }

  function applyDistance(next) {
    distance = Math.min(900, Math.max(24, next));
    const offset = camera.position.clone().sub(controls.target);
    if (offset.lengthSq() < 1e-6) offset.set(0, 0, 1);
    offset.setLength(distance);
    camera.position.copy(controls.target).add(offset);
    host.dataset.scale = String(Math.round((FAR / distance) * 1000) / 1000);
  }

  function distanceForT(t) {
    const u = Math.min(100, Math.max(0, Number(t) || 0)) / 100;
    return FAR * Math.pow(NEAR / FAR, u);
  }

  function tForDistance(value) {
    const ratio = Math.min(FAR, Math.max(NEAR, value)) / FAR;
    return Math.round(100 * Math.log(ratio) / Math.log(NEAR / FAR));
  }

  function endpoint(id) {
    return typeof id === 'string' ? id : id?.id || '';
  }

  function pointOf(node) {
    if (node?.__threeObj) return node.__threeObj.position;
    if (Number.isFinite(node?.x)) return { x: node.x, y: node.y || 0, z: node.z || 0 };
    return null;
  }

  function aim(stopId) {
    const nodes = graph.graphData().nodes || [];
    const links = graph.graphData().links || [];
    const pair = (host.dataset.pair || '').split('|');
    let chosen = nodes;
    if (stopId === 'region') {
      const ids = new Set();
      for (const link of links) {
        const source = endpoint(link.source);
        const target = endpoint(link.target);
        if (source) ids.add(source);
        if (target) ids.add(target);
      }
      const group = nodes.filter(node => ids.has(node.id));
      if (group.length) chosen = group;
    } else if (stopId === 'street') {
      const pairNodes = nodes.filter(node => node.focused);
      if (pairNodes.length) chosen = pairNodes;
    } else if (stopId === 'object') {
      const subject = nodes.find(node => node.id === pair[0]) || nodes.find(node => node.focused);
      if (subject) chosen = [subject];
    }
    const points = chosen.map(pointOf).filter(Boolean);
    const target = new THREE.Vector3();
    for (const point of points) target.add(new THREE.Vector3(point.x, point.y, point.z));
    if (points.length) target.multiplyScalar(1 / points.length);
    controls.target.copy(target);
  }

  function presence(node) {
    if (layoutMode === 'shelf') return node.focused ? 1 : 0.92;
    const scope = host.dataset.scope || 'world';
    if (scope === 'world') return 1;
    if (scope === 'region') {
      const links = graph.graphData().links || [];
      const linked = links.some(link => endpoint(link.source) === node.id || endpoint(link.target) === node.id);
      return linked ? 1 : 0.16;
    }
    if (scope === 'street') return node.focused ? 1 : 0.1;
    const subject = (host.dataset.pair || '').split('|')[0];
    if (subject && node.id === subject) return 1;
    return node.focused ? 0.34 : 0.07;
  }

  function commitZoom(nextDistance, retarget) {
    const stop = nearestZoomStop(tForDistance(Math.min(900, Math.max(24, nextDistance))));
    const before = host.dataset.scope || 'world';
    if (retarget || stop.id !== before) aim(stop.id);
    host.dataset.scope = stop.id;
    applyDistance(nextDistance);
    host.dataset.zoom = String(tForDistance(distance));
    const scale = distance / FAR;
    graph.linkWidth(link => (link.focused ? 5.2 : 2.1) * scale);
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    dreamField?.fit(camera);
  }

  let layoutMode = 'constellation';
  function shelfSlot(index, count){
    const cols = count <= 4 ? Math.max(1, count) : 4;
    const col = index % cols;
    const row = Math.floor(index / cols);
    const pitchX = 40;
    const pitchY = 36;
    const rows = Math.ceil(count / cols);
    const width = (cols - 1) * pitchX;
    const height = (rows - 1) * pitchY;
    return { x: col * pitchX - width / 2, y: height / 2 - row * pitchY, z: 0 };
  }
  function pinShelf(nodes){
    const order = [...nodes].sort((a, b) => Number(Boolean(b.focused)) - Number(Boolean(a.focused)) || String(a.label || a.id).localeCompare(String(b.label || b.id)));
    order.forEach((node, index) => {
      const place = shelfSlot(index, order.length);
      node.x = place.x;
      node.y = place.y;
      node.z = place.z;
      node.fx = place.x;
      node.fy = place.y;
      node.fz = place.z;
      node.vx = 0;
      node.vy = 0;
      node.vz = 0;
    });
  }
  function setGraph(nodes, links, options = {}) {
    layoutMode = options.layout === 'shelf' ? 'shelf' : 'constellation';
    const previous = new Map((graph.graphData().nodes || []).map(node => [node.id, node]));
    const accent = new Map();
    for (const link of [...links.filter(item => !item.focused), ...links.filter(item => item.focused)]) {
      if (!link.color) continue;
      const source = typeof link.source === 'string' ? link.source : link.source?.id;
      const target = typeof link.target === 'string' ? link.target : link.target?.id;
      if (source) accent.set(source, link.color);
      if (target) accent.set(target, link.color);
    }
    pairHighlight = null;
    cluster = null;
    host.dataset.pair = '';
    host.dataset.pairHighlight = '';
    host.dataset.cluster = '';
    host.dataset.clusterLabel = '';
    const nextNodes = nodes.map(node => {
      const painted = { ...node, accent: node.voice || accent.get(node.id) || '' };
      const prior = previous.get(node.id);
      if (!prior) return { ...painted, fx: undefined, fy: undefined, fz: undefined };
      return Object.assign(prior, painted, { fx: undefined, fy: undefined, fz: undefined });
    });
    if (layoutMode === 'shelf') {
      pinShelf(nextNodes);
      controls.target.set(0, 0, 0);
    }
    graph.graphData({ nodes: nextNodes, links: links.map(link => ({ ...link })) });
    const chargeForce = graph.d3Force('charge');
    if (chargeForce) chargeForce.strength(nextNodes.length > 40 ? -34 : -140);
    const linkForce = graph.d3Force('link');
    if (linkForce) linkForce.distance(link => link.focused ? 36 : 84);
    list.replaceChildren();
    for (const node of nextNodes) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'graph-node' + (node.neighbor ? ' conversation-edge' : '') + (node.emphasized ? ' emphasized' : '') + (node.focused ? ' selected' : '') + (node.schematic ? ' schematic' : '');
      button.dataset.accession = node.id;
      button.textContent = node.label || node.id;
      if(!node.schematic)button.style.fontStyle='italic';
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
    host.dataset.pair = sourceId + '|' + targetId;
    if (layoutMode === 'shelf') return;
    for (const node of graph.graphData().nodes || []) {
      if (node.id === sourceId) { node.fx = -18; node.fy = 0; node.fz = 0; }
      else if (node.id === targetId) { node.fx = 18; node.fy = 0; node.fz = 0; }
      else { node.fx = undefined; node.fy = undefined; node.fz = undefined; }
    }
    graph.d3ReheatSimulation();
  }

  function setSpeaking(nodeId) {
    speakingId = nodeId || '';
    host.dataset.speaking = speakingId;
  }

  function setPointing(nodeId) {
    pointingId = nodeId || '';
    host.dataset.pointing = pointingId;
    host.querySelectorAll('.graph-node').forEach(button => {
      const id = button.dataset.accession;
      const paired = (Boolean(cluster) && cluster.ids.has(id)) || (Boolean(pairHighlight) && (id === pairHighlight.source || id === pairHighlight.target));
      button.classList.toggle('pointed', paired || (Boolean(pointingId) && id === pointingId));
    });
  }

  function linkMesh(link) {
    const obj = link.__lineObj;
    if (!obj) return null;
    return obj.children?.length ? obj.children[0] : obj;
  }

  function paintPairLinks() {
    for (const link of graph.graphData().links || []) {
      const mesh = linkMesh(link);
      if (!mesh?.material) continue;
      const source = endpoint(link.source);
      const target = endpoint(link.target);
      const hot = cluster
        ? cluster.ids.has(source) && cluster.ids.has(target) && link.label === cluster.label
        : Boolean(pairHighlight) && ((source === pairHighlight.source && target === pairHighlight.target) || (source === pairHighlight.target && target === pairHighlight.source));
      if (!pairHighlight && !cluster) {
        if (mesh.userData.sharedMaterial && mesh.material === mesh.userData.pairMaterial) mesh.material = mesh.userData.sharedMaterial;
        continue;
      }
      if (mesh.material !== mesh.userData.pairMaterial) {
        mesh.userData.sharedMaterial = mesh.material;
        mesh.userData.pairMaterial = mesh.material.clone();
        mesh.material = mesh.userData.pairMaterial;
      }
      mesh.material.opacity = hot ? 1 : 0.16;
      mesh.material.transparent = true;
    }
  }

  function setPairHighlight(sourceId, targetId, colors) {
    if (!sourceId || !targetId) pairHighlight = null;
    else pairHighlight = { source: sourceId, target: targetId, colors: colors || {} };
    host.dataset.pairHighlight = pairHighlight ? sourceId + '|' + targetId : '';
    setPointing(pointingId);
    paintPairLinks();
  }

  function frameCluster() {
    const nodes = (graph.graphData().nodes || []).filter(node => cluster.ids.has(node.id));
    const points = nodes.map(pointOf).filter(Boolean);
    if (!points.length) return;
    const target = new THREE.Vector3();
    for (const point of points) target.add(new THREE.Vector3(point.x, point.y, point.z));
    target.multiplyScalar(1 / points.length);
    let radius = 12;
    for (const point of points) radius = Math.max(radius, Math.hypot(point.x - target.x, point.y - target.y, (point.z || 0) - target.z));
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fitted = (radius + 22) / Math.tan(fov / 2) * 1.45;
    controls.target.copy(target);
    applyDistance(Math.min(FAR, Math.max(distanceForT(34), fitted)));
    host.dataset.scope = 'region';
    host.dataset.zoom = String(tForDistance(distance));
  }

  function setClusterHighlight(ids, label, color) {
    if (!ids?.length) {
      const had = Boolean(cluster);
      cluster = null;
      host.dataset.cluster = '';
      host.dataset.clusterLabel = '';
      paintPairLinks();
      if (had) commitZoom(FAR, true);
      return;
    }
    cluster = { ids: new Set(ids), label: label || '', color: color || '#f4f4f4' };
    host.dataset.cluster = [...cluster.ids].sort().join('|');
    host.dataset.clusterLabel = cluster.label;
    paintPairLinks();
    frameCluster();
  }

  function pulse() {
    const time = performance.now() / 1000;
    for (const node of graph.graphData().nodes || []) {
      const group = node.__threeObj;
      const sprite = group?.userData?.sprite;
      const frame = group?.userData?.frame;
      if (!sprite || !frame) continue;
      const speaking = node.id === speakingId;
      const grouped = Boolean(cluster) && cluster.ids.has(node.id);
      const inPair = grouped || (Boolean(pairHighlight) && (node.id === pairHighlight.source || node.id === pairHighlight.target));
      const pointing = (Boolean(pointingId) && node.id === pointingId) || inPair;
      const quiet = (Boolean(pointingId) || Boolean(pairHighlight) || Boolean(cluster)) && !speaking && !pointing
      const scale = speaking ? 1 + Math.sin(time * 8) * 0.22 : pointing ? 1.16 : 1;
      const [fitW, fitH] = fittedSize(sprite.material.map);
      sprite.scale.set(fitW * scale, fitH * scale, 1);
      const shown = presence(node) * (quiet ? 0.38 : 1);
      sprite.material.opacity = shown;
      if (speaking) host.dataset.pulse = String(Math.round(scale * 100) / 100);
      const bars = frameBars(fitW, fitH, { focused: Boolean(node.focused), scale });
      frame.children.forEach((piece, index) => {
        const bar = bars[index];
        piece.scale.set(bar.w, bar.h, 1);
        piece.position.set(bar.x, bar.y, 0.2);
      });
      const material = frame.children[0]?.material;
      if (material) {
        const voice = grouped ? cluster.color : (inPair ? pairHighlight.colors?.[node.id] : '');
        material.color.set(voice || node.accent || node.color || '#f4f4f4');
        material.opacity = (speaking || pointing ? 1 : node.focused ? 0.95 : node.accent ? 0.78 : 0.16) * shown;
      }
      frame.lookAt(camera.position);
    }
    paintPairLinks();
  }

  const projector = new THREE.Vector3();
  function screenPoint(node, rect) {
    const object = node?.__threeObj;
    if (object) object.getWorldPosition(projector);
    else if (Number.isFinite(node?.x)) projector.set(node.x, node.y || 0, node.z || 0);
    else return null;
    projector.project(camera);
    if (projector.z < -1 || projector.z > 1) return null;
    return {
      x: (projector.x * 0.5 + 0.5) * rect.width + rect.left,
      y: (-projector.y * 0.5 + 0.5) * rect.height + rect.top,
    };
  }
  function linkUnder(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    let best = null;
    let bestDist = 24;
    for (const link of graph.graphData().links || []) {
      const source = endpoint(link.source);
      const target = endpoint(link.target);
      const start = screenPoint(link.source, rect);
      const end = screenPoint(link.target, rect);
      if (!source || !target || !start || !end) continue;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = dx * dx + dy * dy;
      const t = length ? Math.max(0, Math.min(1, ((clientX - start.x) * dx + (clientY - start.y) * dy) / length)) : 0;
      const x = start.x + dx * t;
      const y = start.y + dy * t;
      const along = Math.hypot(clientX - x, clientY - y);
      const fromEnds = Math.min(Math.hypot(clientX - start.x, clientY - start.y), Math.hypot(clientX - end.x, clientY - end.y));
      if (fromEnds < 36 || along >= bestDist) continue;
      bestDist = along;
      best = { source, target };
    }
    return best;
  }
  canvas.addEventListener('pointermove', event => {
    canvas.style.cursor = linkUnder(event.clientX, event.clientY) ? 'pointer' : '';
    if (pointerDown && Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 5) onDrag?.();
  });
  canvas.addEventListener('pointerdown', event => { pointerDown = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener('pointerup', event => {
    if (!pointerDown || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 5) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(graph.children, true).map(item => nodeIdOf(item.object)).find(Boolean);
    const link = linkUnder(event.clientX, event.clientY);
    if (link && !hit) onLink?.(link.source, link.target);
    else if (hit) onSelect?.(hit);
  });

  const observer = new ResizeObserver(() => resize());
  observer.observe(host);
  resize();

  function frame() {
    graph.tickFrame();
    pulse();
    controls.update();
    if (dreamField) {
      dreamField.fit(camera);
      dreamField.tick(performance.now() / 1000);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    setGraph,
    focusPair,
    setSpeaking,
    setPointing,
    setPairHighlight,
    setClusterHighlight,
    resize,
    zoom(factor) { commitZoom(camera.position.distanceTo(controls.target) / factor, false); },
    fit() { commitZoom(FAR, true); },
    setZoomT(t) { commitZoom(distanceForT(t), true); },
    zoomT() { return Number(host.dataset.zoom || 0); },
    scale() { return Number(host.dataset.scale); },
    setDream(options) {
      if (!dreamField) return;
      const color = dreamField.setDream(options);
      if (color) scene.background.set(color);
    },
    setLandscape(url, clarity) {
      if (!dreamField || !url) return;
      const texture = textureFor(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      dreamField.setLandscape(texture, clarity);
    },
    clearLandscape() { dreamField?.clearLandscape(); },
  };
}
