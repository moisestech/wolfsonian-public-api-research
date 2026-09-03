const THREE_CDN_URL = 'https://unpkg.com/three@0.168.0/build/three.module.js';

const IMAGE_URLS = [
  'https://res.cloudinary.com/dck5rzi4h/image/upload/v1780282283/art/moisestech-website/research/wolfsonian-fellowship/wolfsonian-4_ugeyy1.png',
  'https://res.cloudinary.com/dck5rzi4h/image/upload/v1780282282/art/moisestech-website/research/wolfsonian-fellowship/wolfsonian-1_ld4mys.png',
  'https://res.cloudinary.com/dck5rzi4h/image/upload/v1780282278/art/moisestech-website/research/wolfsonian-fellowship/wolfsonian-3_yoykcq.png'
];

function noopController() {
  return {
    updateSelection() {},
    destroy() {}
  };
}

export async function createGraphBackdrop(canvas, hostEl) {
  if (!canvas || !hostEl) return noopController();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return noopController();

  try {
    const THREE = await import(THREE_CDN_URL);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const ambient = new THREE.AmbientLight(0xffffff, 0.88);
    const tint = new THREE.PointLight(0x8bd2e0, 0.85, 20);
    tint.position.set(-1.5, 1.8, 4.2);
    scene.add(ambient, tint);

    const textureLoader = new THREE.TextureLoader();
    const layers = [];

    const urls = IMAGE_URLS.slice(0, 3);
    for (let i = 0; i < urls.length; i += 1) {
      const tex = await textureLoader.loadAsync(urls[i]);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.18 - i * 0.03,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set((i - 1) * 1.8, i === 1 ? 0.2 : -0.55 + i * 0.7, -i * 0.6);
      const scale = i === 1 ? 3.7 : 3.1;
      sprite.scale.set(scale, scale * 0.62, 1);
      scene.add(sprite);
      layers.push(sprite);
    }

    const clock = new THREE.Clock();
    const pointer = { x: 0, y: 0 };
    let selectionBoost = 0;
    let selectionTarget = 0;
    let running = true;

    function resize() {
      const rect = hostEl.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width - 24));
      const height = Math.max(1, Math.round(rect.height - 52));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
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
      selectionBoost += (selectionTarget - selectionBoost) * 0.08;

      for (let i = 0; i < layers.length; i += 1) {
        const sprite = layers[i];
        const drift = elapsed * (0.08 + i * 0.03);
        sprite.position.x += Math.sin(drift) * 0.0018;
        sprite.position.y += Math.cos(drift * 1.2) * 0.0013;
        sprite.material.opacity = 0.12 + i * 0.03 + selectionBoost * 0.12;
      }

      camera.position.x += ((pointer.x * 0.12) - camera.position.x) * 0.035;
      camera.position.y += ((pointer.y * 0.08) - camera.position.y) * 0.035;
      tint.intensity = 0.85 + selectionBoost * 0.5;

      renderer.render(scene, camera);
      window.requestAnimationFrame(animate);
    }

    hostEl.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', resize);
    resize();
    animate();

    return {
      updateSelection(selectedSeedId) {
        selectionTarget = selectedSeedId ? 1 : 0;
      },
      destroy() {
        running = false;
        hostEl.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', resize);
        renderer.dispose();
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

