import { hintForStage, languageForStage, loadWorldState } from './world-state.mjs';
import { setStage, stepBack, tickSimulation } from './sim-loop.mjs';
import { createRenderer } from './renderer.mjs';
import { createOverlays } from './overlays.mjs';
import { createDomLayer } from './dom-layer.mjs';

const els = {
  stageName: document.getElementById('stage-name'),
  languageKind: document.getElementById('language-kind'),
  stageHint: document.getElementById('stage-hint'),
  caption: document.getElementById('world-caption'),
  listen: document.getElementById('listen-btn'),
  back: document.getElementById('back-btn'),
  overlays: document.getElementById('overlays'),
  canvas: document.getElementById('world-canvas')
};

function syncHud(world) {
  els.stageName.textContent = world.stage.toUpperCase();
  els.languageKind.textContent = languageForStage(world.stage);
  els.stageHint.textContent = hintForStage(world.stage);
  els.caption.textContent = `${world.record.title.split(',')[0].toUpperCase()} · ${world.record.date} · ${world.record.accessionNumber}`;
  els.listen.hidden = world.stage !== 'encounter';
  els.back.hidden = world.stage === 'world';
}

async function init() {
  const world = await loadWorldState();
  let overlays;

  const renderer = await createRenderer(els.canvas, world, {
    onRadio() {
      if (world.stage === 'world') setStage(world, 'encounter');
      else if (world.stage === 'encounter') setStage(world, 'conversation');
      syncHud(world);
      overlays.renderSpeech();
      overlays.renderInspector();
    },
    onAgent(id) {
      if (world.stage === 'world') setStage(world, 'encounter');
      else if (world.stage === 'encounter') setStage(world, 'conversation');
      else if (world.stage === 'conversation') {
        world.activeClaimId = id;
        setStage(world, 'claim');
      }
      syncHud(world);
      overlays.renderSpeech();
      overlays.renderInspector();
    }
  });

  const domLayer = createDomLayer(els.canvas, world, {
    onRadio() {
      if (world.stage === 'world') setStage(world, 'encounter');
      else if (world.stage === 'encounter') setStage(world, 'conversation');
      syncHud(world);
      overlays.renderSpeech();
      overlays.renderInspector();
    },
    onAgent(id) {
      if (world.stage === 'world') setStage(world, 'encounter');
      else if (world.stage === 'encounter') setStage(world, 'conversation');
      else if (world.stage === 'conversation') {
        world.activeClaimId = id;
        setStage(world, 'claim');
      }
      syncHud(world);
      overlays.renderSpeech();
      overlays.renderInspector();
    }
  });

  overlays = createOverlays(els.overlays, world, {
    onLine(id) {
      world.activeClaimId = id;
      setStage(world, 'claim');
      syncHud(world);
      overlays.renderSpeech();
      overlays.renderInspector();
    },
    onEvidence() {
      setStage(world, 'evidence');
      syncHud(world);
      overlays.renderInspector();
    },
    onResidency() {
      setStage(world, 'residency');
      syncHud(world);
      overlays.renderInspector();
    }
  });

  els.listen.addEventListener('click', () => {
    setStage(world, 'conversation');
    syncHud(world);
    overlays.renderSpeech();
    overlays.renderInspector();
  });

  els.back.addEventListener('click', () => {
    stepBack(world);
    syncHud(world);
    overlays.renderSpeech();
    overlays.renderInspector();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    stepBack(world);
    syncHud(world);
    overlays.renderSpeech();
    overlays.renderInspector();
  });

  let last = performance.now();
  let lineClock = 0;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tickSimulation(world, dt);
    if (world.stage === 'conversation' && !world.reducedMotion) {
      lineClock += dt;
      const next = Math.min(world.speakingOrder.length - 1, Math.floor(lineClock / 2.4));
      if (next !== world.spokenIndex) {
        world.spokenIndex = next;
        overlays.renderSpeech();
      }
    }
    renderer.render();
    domLayer.render();
    syncHud(world);
    requestAnimationFrame(frame);
  }

  syncHud(world);
  overlays.renderSpeech();
  overlays.renderInspector();
  requestAnimationFrame(frame);
}

init().catch((error) => {
  document.body.innerHTML = `<main style="padding:2rem;font-family:serif"><h1>World 0.1 failed to load</h1><p>${error.message}</p></main>`;
});
