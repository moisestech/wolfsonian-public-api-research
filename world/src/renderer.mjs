import { Application, Assets, Container, Graphics, Sprite, Text, TextStyle } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/+esm';

const COLORS = {
  archivist: 0x2c3338,
  worker: 0x6b4a2b,
  futurist: 0x0b5f6b,
  propagandist: 0x8b3a2f
};

const WORLD_W = 1200;
const WORLD_H = 700;

export async function createRenderer(host, world, handlers) {
  // Wait for layout so resizeTo does not lock to the default 800×600 canvas.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const startW = Math.max(host.clientWidth || 0, 640);
  const startH = Math.max(host.clientHeight || 0, 360);

  const app = new Application();
  await app.init({
    width: startW,
    height: startH,
    backgroundColor: 0xeef3ee,
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    preference: 'webgl'
  });
  host.append(app.canvas);
  app.canvas.style.width = '100%';
  app.canvas.style.height = '100%';
  app.canvas.style.display = 'block';

  const scene = new Container();
  app.stage.addChild(scene);

  const ground = new Graphics();
  ground.rect(0, 0, WORLD_W, WORLD_H);
  ground.fill(0xe8eee8);
  ground.circle(world.radio.x, world.radio.y + 40, 210);
  ground.fill({ color: 0xd5e0d8, alpha: 0.55 });
  scene.addChild(ground);

  const radio = new Graphics();
  radio.roundRect(world.radio.x - 54, world.radio.y - 38, 108, 76, 8);
  radio.fill(0xf7f9fa);
  radio.stroke({ width: 2, color: 0x1c2429 });
  radio.rect(world.radio.x - 36, world.radio.y - 12, 72, 8);
  radio.fill(0x1c2429);
  scene.addChild(radio);

  try {
    const texture = await Assets.load('../demo/assets/objects/sparton-radio.svg');
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.position.set(world.radio.x, world.radio.y - 8);
    sprite.scale.set(1.6);
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    sprite.on('pointertap', () => handlers.onRadio());
    scene.addChild(sprite);
  } catch {
    radio.eventMode = 'static';
    radio.cursor = 'pointer';
    radio.on('pointertap', () => handlers.onRadio());
  }

  const radioLabel = new Text({
    text: 'SPARTON RADIO',
    style: new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 12,
      letterSpacing: 2,
      fill: 0x5a656c
    })
  });
  radioLabel.anchor.set(0.5, 0);
  radioLabel.position.set(world.radio.x, world.radio.y + 48);
  scene.addChild(radioLabel);

  const yearLabel = new Text({
    text: '1937',
    style: new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 11,
      fill: 0x5a656c
    })
  });
  yearLabel.anchor.set(0.5, 0);
  yearLabel.position.set(world.radio.x, world.radio.y + 64);
  scene.addChild(yearLabel);

  const tokens = new Map();
  for (const agent of world.agents) {
    const g = new Container();
    g.eventMode = 'static';
    g.cursor = 'pointer';
    g.on('pointertap', () => handlers.onAgent(agent.id));

    const disc = new Graphics();
    disc.circle(0, 0, 16);
    disc.fill(COLORS[agent.id]);
    g.addChild(disc);

    try {
      const tex = await Assets.load(agent.portrait);
      const face = new Sprite(tex);
      face.anchor.set(0.5);
      face.width = 28;
      face.height = 28;
      g.addChild(face);
    } catch {
      /* token color is enough */
    }

    const name = new Text({
      text: agent.label.toUpperCase(),
      style: new TextStyle({
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 10,
        letterSpacing: 1,
        fill: 0x1c2429
      })
    });
    name.anchor.set(0.5, 0);
    name.position.set(0, 22);
    g.addChild(name);

    const role = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Newsreader, serif',
        fontSize: 11,
        fill: 0x5a656c
      })
    });
    role.anchor.set(0.5, 0);
    role.position.set(0, 36);
    g.addChild(role);

    scene.addChild(g);
    tokens.set(agent.id, { g, role });
  }

  const camera = { x: WORLD_W / 2, y: WORLD_H / 2, scale: 0.82 };

  function fit() {
    const w = Math.max(host.clientWidth || 0, 640);
    const h = Math.max(host.clientHeight || 0, 360);
    if (app.renderer.width !== Math.floor(w * app.renderer.resolution) || app.renderer.height !== Math.floor(h * app.renderer.resolution)) {
      app.renderer.resize(w, h);
    }
    const targetScale = world.stage === 'world' ? 0.72 : 1.18;
    const targetX = world.stage === 'world' ? WORLD_W / 2 : world.radio.x;
    const targetY = world.stage === 'world' ? WORLD_H / 2 - 20 : world.radio.y;
    const ease = world.reducedMotion ? 1 : 0.06;
    camera.scale += (targetScale - camera.scale) * ease;
    camera.x += (targetX - camera.x) * ease;
    camera.y += (targetY - camera.y) * ease;
    scene.scale.set(camera.scale);
    scene.position.set(w / 2 - camera.x * camera.scale, h / 2 - camera.y * camera.scale);
    const dim = world.stage === 'conversation' ? 0.72 : world.stage === 'world' || world.stage === 'encounter' ? 1 : 0.38;
    scene.alpha += (dim - scene.alpha) * (world.reducedMotion ? 1 : 0.08);
  }

  window.addEventListener('resize', () => {
    const w = Math.max(host.clientWidth || 0, 640);
    const h = Math.max(host.clientHeight || 0, 360);
    app.renderer.resize(w, h);
  });

  function render() {
    fit();
    for (const agent of world.agents) {
      const token = tokens.get(agent.id);
      token.g.position.set(agent.x, agent.y);
      const showRole = world.stage === 'encounter' || world.stage === 'conversation';
      token.role.text = showRole ? agent.attentionLabel : '';
    }
  }

  return { app, render, destroy: () => app.destroy(true) };
}
