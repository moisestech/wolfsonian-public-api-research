import {
  hintForStage,
  languageForStage,
  loadWorldState,
  resetWorldState,
  surfaceForStage
} from './world-state.mjs';
import { setStage, stepBack, tickSimulation } from './sim-loop.mjs';
import { canEnterConversation, clampSimDt, requestStage } from './world-logic.mjs';
import { createOverlays } from './overlays.mjs';
import { createDomLayer } from './dom-layer.mjs';

const els = {
  stageName: document.getElementById('stage-name'),
  languageKind: document.getElementById('language-kind'),
  stageHint: document.getElementById('stage-hint'),
  caption: document.getElementById('world-caption'),
  back: document.getElementById('back-btn'),
  restart: document.getElementById('restart-btn'),
  overlays: document.getElementById('overlays'),
  canvas: document.getElementById('world-canvas')
};

function syncHud(world) {
  els.stageName.textContent = surfaceForStage(world.stage);
  const beat =
    world.stage === 'world'
      ? ''
      : world.stage === 'encounter'
        ? ' · Encounter'
        : world.stage === 'conversation'
          ? ' · Conversation'
          : ` · ${world.stage[0].toUpperCase()}${world.stage.slice(1)}`;
  els.languageKind.textContent = `${languageForStage(world.stage)}${beat}`;
  els.stageHint.textContent = hintForStage(world.stage);
  els.caption.textContent = `${world.record.title.split(',')[0].toUpperCase()} · ${world.record.date} · ${world.record.accessionNumber}`;
  els.back.hidden = world.stage === 'world';
}

function refresh(world, overlays) {
  syncHud(world);
  overlays.renderSpeech();
  overlays.renderInspector();
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    })
  ]);
}

async function tryCreateRenderer(world, handlers) {
  try {
    const { createRenderer } = await import('./renderer.mjs');
    return await withTimeout(createRenderer(els.canvas, world, handlers), 12000, 'Pixi renderer');
  } catch (error) {
    console.warn('[world] Pixi unavailable; continuing with DOM layer.', error);
    els.canvas.classList.add('world-canvas--dom-only');
    return {
      render() {},
      resetCamera() {},
      destroy() {}
    };
  }
}

async function init() {
  const world = await loadWorldState();
  window.__archiveDreamsWorld = world;
  let overlays;
  let lineClock = 0;
  let pausedByVisibility = false;

  function enterClaim(id) {
    const gate = requestStage(world, 'claim');
    if (!gate.ok && world.stage !== 'conversation') return;
    world.activeClaimId = id || 'futurist';
    setStage(world, 'claim');
    refresh(world, overlays);
  }

  function enterConversation() {
    if (!canEnterConversation(world)) return false;
    const gate = requestStage(world, 'conversation');
    if (!gate.ok) return false;
    setStage(world, 'conversation');
    if (world.spokenIndex < 0) world.spokenIndex = 0;
    refresh(world, overlays);
    return true;
  }

  const handlers = {
    onRadio() {
      if (world.stage === 'world') setStage(world, 'encounter');
      else if (world.stage === 'encounter' && canEnterConversation(world)) {
        enterConversation();
        return;
      }
      refresh(world, overlays);
    },
    onAgent(id) {
      if (world.stage === 'world') setStage(world, 'encounter');
      else if (world.stage === 'encounter' && canEnterConversation(world)) {
        enterConversation();
        return;
      } else if (world.stage === 'conversation') {
        enterClaim(id);
        return;
      }
      refresh(world, overlays);
    },
    onContradiction() {
      if (!canEnterConversation(world)) return;
      if (world.stage === 'encounter') {
        enterConversation();
        return;
      }
      if (world.stage === 'conversation') {
        enterClaim('futurist');
      }
    }
  };

  const domLayer = createDomLayer(els.canvas, world, handlers);
  overlays = createOverlays(els.overlays, world, {
    onLine(id) {
      enterClaim(id);
    },
    onEvidence() {
      setStage(world, 'evidence');
      refresh(world, overlays);
    },
    onResidency() {
      setStage(world, 'residency');
      refresh(world, overlays);
    },
    onReturnWorld() {
      world.activeClaimId = null;
      world.conversationLine = null;
      world.spokenIndex = -1;
      setStage(world, 'encounter');
      refresh(world, overlays);
    }
  });

  refresh(world, overlays);

  let renderer = {
    render() {},
    resetCamera() {},
    destroy() {}
  };
  tryCreateRenderer(world, handlers).then((r) => {
    renderer = r;
  });

  function doRestart() {
    resetWorldState(world);
    lineClock = 0;
    renderer.resetCamera?.();
    refresh(world, overlays);
  }

  els.back.addEventListener('click', () => {
    stepBack(world);
    refresh(world, overlays);
  });

  els.restart.addEventListener('click', doRestart);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      stepBack(world);
      refresh(world, overlays);
    }
    if (event.key === 'r' || event.key === 'R') {
      if (event.target.closest('input, textarea, [contenteditable]')) return;
      doRestart();
    }
    if (event.key === 'Enter' || event.key === ' ') {
      const target = event.target;
      if (target?.classList?.contains('dom-contradiction')) {
        event.preventDefault();
        handlers.onContradiction();
      }
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      pausedByVisibility = true;
    } else {
      pausedByVisibility = false;
      last = performance.now();
    }
  });

  let last = performance.now();

  function frame(now) {
    if (pausedByVisibility || document.visibilityState === 'hidden') {
      last = now;
      requestAnimationFrame(frame);
      return;
    }

    const dt = clampSimDt((now - last) / 1000);
    last = now;
    if (dt > 0) tickSimulation(world, dt);

    if (world.stage === 'conversation' && !world.reducedMotion) {
      lineClock += dt;
      const next = Math.min(1, Math.floor(lineClock / 2.2));
      if (next !== world.spokenIndex) {
        world.spokenIndex = next;
        overlays.renderSpeech();
      }
    } else if (world.stage !== 'conversation') {
      lineClock = 0;
    }
    renderer.render();
    domLayer.render();
    syncHud(world);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

init().catch((error) => {
  document.body.innerHTML = `<main style="padding:2rem;font-family:serif"><h1>World 0.1 failed to load</h1><p>${error.message}</p></main>`;
});
