import * as THREE from 'three';

const INK = '#111111';
const PAPER = '#f6f4eb';

const vertexShader = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform float uDream;
uniform float uPaper;
uniform float uReduced;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main(){
  vec3 ink = vec3(0.0666667);
  vec3 paper = vec3(0.964706, 0.956863, 0.921569);
  vec3 copper = vec3(0.854902, 0.615686, 0.462745);
  vec3 teal = vec3(0.443137, 0.768627, 0.694118);
  vec3 ground = mix(ink, paper, uPaper);
  float presence = clamp(uDream, 0.0, 1.0);
  float motion = presence * (1.0 - uReduced);
  vec2 flow = vUv + vec2(uTime * 0.008, uTime * 0.005) * motion;
  float freq = mix(78.0, 128.0, uPaper);
  vec2 cell = flow * freq;
  vec2 f = fract(cell) - 0.5;
  float patch = 0.84 + 0.16 * hash(floor(flow * 2.2));
  float dotA = smoothstep(0.42, 0.2, length(f)) * patch;
  vec2 shifted = fract(cell + vec2(1.6, 0.9) * motion) - 0.5;
  float dotB = smoothstep(0.36, 0.18, length(shifted)) * patch;
  float grain = hash(floor(cell)) - 0.5;
  vec3 dream = ground;
  dream += mix(copper, ink, uPaper) * dotA * mix(0.36, 0.18, uPaper);
  dream += teal * dotB * motion * 0.28;
  dream += grain * presence * 0.05;
  vec2 p = vUv * 2.0 - 1.0;
  float vig = smoothstep(1.15, 0.2, length(p));
  dream = mix(dream * mix(0.62, 0.86, uPaper), dream, mix(1.0, vig, presence));
  gl_FragColor = vec4(mix(ground, dream, presence), 1.0);
}
`;

export function createDreamField(){
  const uniforms = {
    uTime: { value: 0 },
    uDream: { value: 0 },
    uPaper: { value: 0 },
    uReduced: { value: 0 },
  };
  const dreamMaterial = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const landscapeMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), dreamMaterial);
  mesh.name = 'dream-field';
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  mesh.raycast = () => {};
  const forward = new THREE.Vector3();
  let target = 0;
  let mode = 'dream';

  function fit(camera){
    const distance = camera.far * 0.5;
    camera.getWorldDirection(forward);
    mesh.position.copy(camera.position).addScaledVector(forward, distance);
    mesh.quaternion.copy(camera.quaternion);
    mesh.rotateY(Math.PI);
    const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * distance * 1.04;
    mesh.scale.set(height * Math.max(camera.aspect, 0.01), height, 1);
  }

  function setDream({ amount = 0, reduced = false, paper = false } = {}){
    if(mode === 'landscape') return null;
    target = amount ? 1 : 0;
    uniforms.uReduced.value = reduced ? 1 : 0;
    uniforms.uPaper.value = paper ? 1 : 0;
    mesh.material = dreamMaterial;
    mesh.visible = true;
    return paper ? PAPER : INK;
  }

  function setLandscape(texture, clarity){
    mode = 'landscape';
    landscapeMaterial.map = texture;
    landscapeMaterial.color.setScalar(Math.max(0.35, Math.min(1, Number(clarity) / 80)));
    landscapeMaterial.needsUpdate = true;
    mesh.material = landscapeMaterial;
    mesh.visible = true;
  }

  function clearLandscape(){
    if(mode === 'dream') return;
    mode = 'dream';
    mesh.material = dreamMaterial;
    mesh.visible = true;
  }

  function tick(now){
    uniforms.uTime.value = now;
    const next = uniforms.uDream.value + (target - uniforms.uDream.value) * 0.045;
    uniforms.uDream.value = Math.abs(target - next) < 0.002 ? target : next;
  }

  return { mesh, fit, setDream, setLandscape, clearLandscape, tick, ink: INK, paper: PAPER };
}
