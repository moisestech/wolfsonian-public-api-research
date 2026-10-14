import { Application, Assets, Container, Graphics, Sprite, Text, TextStyle } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/+esm';

const COLORS = {
  worker: 0x6b4a2b,
  futurist: 0x0b5f6b,
  archivist: 0x2c3338
};

const WORLD_W = 1200;
const WORLD_H = 700;

export async function createRenderer(host, world, handlers) {
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

  // Opposition axis (subtle) — appears once both readers attend.
  const axis = new Graphics();
  scene.addChild(axis);

  // Archivist provenance ring / tether (constraint, not a character token).
  const constraintGfx = new Graphics();
  scene.addChild(constraintGfx);

  const radio = new Graphics();
  radio.roundRect(world.radio.x - 54, world.radio.y - 38, 108, 76, 8);
  radio.fill(0xf7f9fa);
  radio.stroke({ width: 2, color: 0x1c2429 });
  radio.rect(world.radio.x - 36, world.radio.y - 12, 72, 8);
  radio.fill(0x1c2429);
  scene.addChild(radio);

  // Incomplete contour = packet gap (not fog / buried treasure).
  const gapContour = new Graphics();
  scene.addChild(gapContour);
  drawIncompleteContour(gapContour, world.radio.x, world.radio.y);

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
    text: '1937 · XX1990.1484',
    style: new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 11,
      fill: 0x5a656c
    })
  });
  yearLabel.anchor.set(0.5, 0);
  yearLabel.position.set(world.radio.x, world.radio.y + 64);
  scene.addChild(yearLabel);

  const gapCaption = new Text({
    text: 'packet incomplete',
    style: new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 9,
      letterSpacing: 1,
      fill: 0x8a9399
    })
  });
  gapCaption.anchor.set(0.5, 0);
  gapCaption.position.set(world.radio.x + 78, world.radio.y - 28);
  scene.addChild(gapCaption);

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
    if (
      app.renderer.width !== Math.floor(w * app.renderer.resolution) ||
      app.renderer.height !== Math.floor(h * app.renderer.resolution)
    ) {
      app.renderer.resize(w, h);
    }
    const research = ['claim', 'evidence', 'residency'].includes(world.stage);
    const targetScale = world.stage === 'world' ? 0.72 : 1.18;
    const targetX = world.stage === 'world' ? WORLD_W / 2 : world.radio.x;
    const targetY = world.stage === 'world' ? WORLD_H / 2 - 20 : world.radio.y;
    const ease = world.reducedMotion ? 1 : 0.06;
    camera.scale += (targetScale - camera.scale) * ease;
    camera.x += (targetX - camera.x) * ease;
    camera.y += (targetY - camera.y) * ease;
    scene.scale.set(camera.scale);
    scene.position.set(w / 2 - camera.x * camera.scale, h / 2 - camera.y * camera.scale);
    const dim = world.stage === 'conversation' ? 0.78 : research ? 0.42 : 1;
    scene.alpha += (dim - scene.alpha) * (world.reducedMotion ? 1 : 0.08);
  }

  window.addEventListener('resize', () => {
    const w = Math.max(host.clientWidth || 0, 640);
    const h = Math.max(host.clientHeight || 0, 360);
    app.renderer.resize(w, h);
  });

  function renderConstraint() {
    constraintGfx.clear();
    const tension = world.archivistConstraint?.tension || 0;
    const pulse = world.archivistConstraint?.pulse || 0;
    const r = 92 + tension * 10 + pulse * 8;
    const alpha = 0.22 + tension * 0.45;
    constraintGfx.circle(world.radio.x, world.radio.y, r);
    constraintGfx.stroke({ width: 1.5 + tension, color: COLORS.archivist, alpha });

    // Tether toward Futurist when inference tension rises.
    const futurist = world.agents.find((a) => a.id === 'futurist');
    if (futurist && tension > 0.15) {
      constraintGfx.moveTo(world.radio.x, world.radio.y - 40);
      constraintGfx.lineTo(futurist.x, futurist.y);
      constraintGfx.stroke({
        width: 1 + tension,
        color: COLORS.archivist,
        alpha: 0.2 + tension * 0.55
      });
    }
  }

  function renderAxis() {
    axis.clear();
    if (world.stage === 'world') return;
    const futurist = world.agents.find((a) => a.id === 'futurist');
    const worker = world.agents.find((a) => a.id === 'worker');
    if (!futurist || !worker) return;
    const show = world.stage !== 'world';
    if (!show) return;
    axis.moveTo(futurist.x, futurist.y);
    axis.lineTo(worker.x, worker.y);
    axis.stroke({
      width: world.contradiction.active ? 2 : 1,
      color: world.contradiction.active ? 0x8b3a2f : 0x5a656c,
      alpha: world.contradiction.active ? 0.55 : 0.22
    });
  }

  function render() {
    fit();
    renderConstraint();
    renderAxis();
    for (const agent of world.agents) {
      const token = tokens.get(agent.id);
      if (!token) continue;
      token.g.position.set(agent.x, agent.y);
      const showRole = world.stage === 'encounter' || world.stage === 'conversation';
      token.role.text = showRole ? agent.attentionLabel : '';
    }
  }

  return { app, render, destroy: () => app.destroy(true) };
}

function drawIncompleteContour(g, cx, cy) {
  // Solid plaque edge on the established side…
  g.moveTo(cx - 62, cy - 44);
  g.lineTo(cx + 20, cy - 44);
  g.stroke({ width: 2, color: 0x1c2429, alpha: 0.85 });

  // …dashed / torn edge where the packet does not establish labor/use.
  const dash = 7;
  const gap = 5;
  let x = cx + 22;
  const endX = cx + 62;
  let y = cy - 44;
  while (x < endX) {
    const next = Math.min(x + dash, endX);
    g.moveTo(x, y);
    g.lineTo(next, y);
    g.stroke({ width: 2, color: 0x5a656c, alpha: 0.7 });
    x = next + gap;
  }
  // Vertical tear on the incomplete side
  let vy = cy - 40;
  const endY = cy + 36;
  while (vy < endY) {
    const next = Math.min(vy + dash, endY);
    g.moveTo(cx + 62, vy);
    g.lineTo(cx + 62, next);
    g.stroke({ width: 2, color: 0x5a656c, alpha: 0.55 });
    vy = next + gap;
  }
}
