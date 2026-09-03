const THREE_CDN_URL = 'https://unpkg.com/three@0.168.0/build/three.module.js';

const IMAGE_URLS = [
  'https://res.cloudinary.com/dck5rzi4h/image/upload/v1780282283/art/moisestech-website/research/wolfsonian-fellowship/wolfsonian-4_ugeyy1.png',
  'https://res.cloudinary.com/dck5rzi4h/image/upload/v1780282282/art/moisestech-website/research/wolfsonian-fellowship/wolfsonian-1_ld4mys.png',
  'https://res.cloudinary.com/dck5rzi4h/image/upload/v1780282279/art/moisestech-website/research/wolfsonian-fellowship/wolfsonian-2_jenisx.png',
  'https://res.cloudinary.com/dck5rzi4h/image/upload/v1780282278/art/moisestech-website/research/wolfsonian-fellowship/wolfsonian-3_yoykcq.png',
  'https://res.cloudinary.com/dck5rzi4h/image/upload/v1780282280/art/moisestech-website/research/wolfsonian-fellowship/wolfsonian-5_lnsd5t.png'
];

function noopController() {
  return {
    updateSelection() {},
    destroy() {}
  };
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export async function createGraphBackdrop(canvas, hostEl, options = {}) {
  if (!canvas || !hostEl) return noopController();

  const reduced = prefersReducedMotion();
  const intensity = options.intensity ?? 1;
  const urls = (options.urls || IMAGE_URLS).slice(0, options.layerCount ?? 4);

  try {
    const THREE = await import(THREE_CDN_URL);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55 * intensity);
    const tint = new THREE.PointLight(0x8bd2e0, 1.15 * intensity, 24);
    tint.position.set(-1.2, 1.4, 4.4);
    const rim = new THREE.PointLight(0xd4b48c, 0.55 * intensity, 18);
    rim.position.set(2.2, -1.1, 3.2);
    scene.add(ambient, tint, rim);

    const textureLoader = new THREE.TextureLoader();
    const layers = [];

    for (let i = 0; i < urls.length; i += 1) {
      const tex = await textureLoader.loadAsync(urls[i]);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: (0.28 - i * 0.035) * intensity,
        depthWrite: false,
        blending: i === 0 ? THREE.AdditiveBlending : THREE.NormalBlending
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set((i - 1.5) * 1.35, (i % 2 === 0 ? 0.35 : -0.45) + i * 0.12, -i * 0.55);
      const scale = i === 1 ? 4.2 : 3.35;
      sprite.scale.set(scale, scale * 0.68, 1);
      scene.add(sprite);
      layers.push(sprite);
    }

    const spotlightGeo = new THREE.CircleGeometry(1.35, 48);
    const spotlightMat = new THREE.MeshBasicMaterial({
      color: 0x9fe4ee,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const spotlight = new THREE.Mesh(spotlightGeo, spotlightMat);
    spotlight.position.set(0, 0, 1.2);
    scene.add(spotlight);

    const clock = new THREE.Clock();
    const pointer = { x: 0, y: 0 };
    const focus = { x: 0, y: 0 };
    let selectionBoost = 0;
    let selectionTarget = 0;
    let running = true;

    function resize() {
      const rect = hostEl.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    }

    function onPointerMove(event) {
      const rect = hostEl.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
    }

    function animate() {
      if (!running) return;
      const elapsed = clock.getElapsedTime();
      selectionBoost += (selectionTarget - selectionBoost) * 0.1;

      if (!reduced) {
        for (let i = 0; i < layers.length; i += 1) {
          const sprite = layers[i];
          const drift = elapsed * (0.12 + i * 0.04);
          sprite.position.x += Math.sin(drift) * 0.0024;
          sprite.position.y += Math.cos(drift * 1.15) * 0.0018;
          sprite.material.opacity = (0.22 + i * 0.04 + selectionBoost * 0.18) * intensity;
        }
        camera.position.x += (pointer.x * 0.18 + focus.x * 0.35 - camera.position.x) * 0.045;
        camera.position.y += (pointer.y * 0.12 + focus.y * 0.28 - camera.position.y) * 0.045;
      }

      spotlight.position.x += (focus.x * 2.4 - spotlight.position.x) * 0.12;
      spotlight.position.y += (focus.y * 1.6 - spotlight.position.y) * 0.12;
      spotlightMat.opacity = selectionBoost * 0.28 * intensity;
      spotlight.scale.setScalar(1.15 + selectionBoost * 0.55);
      tint.intensity = (1.15 + selectionBoost * 0.85) * intensity;
      rim.intensity = (0.55 + selectionBoost * 0.35) * intensity;

      renderer.render(scene, camera);
      if (!reduced) window.requestAnimationFrame(animate);
    }

    hostEl.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', resize);
    resize();
    animate();

    return {
      updateSelection(selectedSeedId, ndc = null) {
        selectionTarget = selectedSeedId ? 1 : 0;
        if (ndc) {
          focus.x = ndc.x;
          focus.y = ndc.y;
        } else if (!selectedSeedId) {
          focus.x = 0;
          focus.y = 0;
        }
        if (reduced) animate();
      },
      destroy() {
        running = false;
        hostEl.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', resize);
        renderer.dispose();
        spotlightGeo.dispose();
        spotlightMat.dispose();
        layers.forEach((sprite) => {
          sprite.material.map?.dispose();
          sprite.material.dispose();
        });
      }
    };
  } catch (error) {
    console.warn('Three backdrop unavailable; falling back to static graph.', error);
    return noopController();
  }
}
