import { buildEvidenceViewModel } from './world-logic.mjs';
import { buildHandoffFromWorld, openResearchConsole } from './research-handoff.mjs';

function field(dt, dd) {
  const term = document.createElement('dt');
  term.textContent = dt;
  const def = document.createElement('dd');
  if (typeof dd === 'string') def.textContent = dd;
  else def.append(dd);
  return [term, def];
}

function listBlock(title, items, className) {
  const wrap = document.createElement('div');
  wrap.className = `evidence-block ${className || ''}`.trim();
  const h = document.createElement('h3');
  h.textContent = title;
  const ul = document.createElement('ul');
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    ul.append(li);
  }
  wrap.append(h, ul);
  return wrap;
}

function makeTextButton(label, onClick, className = 'text-button') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function appendExploreAction(actions, world) {
  const explore = makeTextButton('Explore in research console', () => {
    const handoff = buildHandoffFromWorld(world);
    if (!handoff) {
      console.warn('[world] Research console handoff unavailable for current claim.');
      return;
    }
    const result = openResearchConsole(handoff, { preferNewTab: true });
    if (!result.opened) {
      console.warn('[world] Research console open failed:', result.reason || 'unknown');
    }
  }, 'text-button text-button--primary');
  explore.setAttribute('data-action', 'explore-research-console');
  actions.append(explore);
}

export function createOverlays(root, world, handlers) {
  const speechLayer = document.createElement('div');
  speechLayer.className = 'speech-layer';
  document.querySelector('.world-canvas').append(speechLayer);

  function renderSpeech() {
    speechLayer.replaceChildren();
    if (world.stage !== 'conversation') return;
    const visible = world.speakingOrder.slice(0, Math.max(1, world.spokenIndex + 1)).slice(0, 2);
    visible.forEach((id, index) => {
      const agent = world.agents.find((a) => a.id === id);
      if (!agent) return;
      const bubble = document.createElement('button');
      bubble.type = 'button';
      bubble.className = 'speech';
      bubble.dataset.agent = id;
      bubble.style.left = index === 0 ? '12%' : '52%';
      bubble.style.top = index === 0 ? '12%' : '58%';
      bubble.setAttribute('aria-label', `${agent.label} interpretation: ${agent.conversationLine}`);
      const small = document.createElement('small');
      small.textContent = `${agent.label} · INTERPRETATION`;
      bubble.append(small, document.createTextNode(agent.conversationLine));
      bubble.addEventListener('click', () => handlers.onLine(id));
      speechLayer.append(bubble);
    });
  }

  function renderInspector() {
    if (!['claim', 'evidence', 'residency'].includes(world.stage)) {
      root.hidden = true;
      root.replaceChildren();
      return;
    }
    root.hidden = false;
    root.replaceChildren();
    const panel = document.createElement('section');
    panel.className = 'inspector inspector--research';
    panel.setAttribute('tabindex', '-1');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');

    if (world.stage === 'claim') {
      const agent =
        world.agents.find((a) => a.id === world.activeClaimId) ||
        world.agents.find((a) => a.id === 'futurist');
      const model = buildEvidenceViewModel(world.record, agent);
      const h2 = document.createElement('h2');
      h2.textContent = 'Claim';
      panel.setAttribute('aria-label', 'Claim inspector');
      const type = document.createElement('p');
      type.className = `claim-type claim-type--${agent.claimType === 'SOURCE_SUPPORTED' ? 'source' : 'inference'}`;
      type.textContent = agent.claimType;
      const dl = document.createElement('dl');
      for (const [k, v] of [
        ['Statement', agent.claim],
        ['Reader', agent.label],
        ['Grounding', world.record.title],
        ['Source identifier', world.record.accessionNumber],
        ['Contradicts', agent.contradicts.join(', ') || 'Opposed reader'],
        ['Uncertainty', agent.uncertainty],
        ['What would change this claim?', agent.onsiteQuestion]
      ]) {
        dl.append(...field(k, v));
      }
      const note = document.createElement('p');
      note.className = 'evidence-note';
      note.textContent = model.note;
      const actions = document.createElement('div');
      actions.className = 'inspector__actions';
      actions.append(
        makeTextButton('Inspect evidence', handlers.onEvidence),
        makeTextButton('What the simulation cannot resolve', handlers.onResidency)
      );
      appendExploreAction(actions, world);
      actions.append(makeTextButton('Return to encounter', handlers.onReturnWorld));
      panel.append(h2, type, dl, note, actions);
    }

    if (world.stage === 'evidence') {
      const agent =
        world.agents.find((a) => a.id === world.activeClaimId) ||
        world.agents.find((a) => a.id === 'futurist');
      const model = buildEvidenceViewModel(world.record, agent);
      const h2 = document.createElement('h2');
      h2.textContent = 'Evidence';
      panel.setAttribute('aria-label', 'Evidence inspector');

      const accession = document.createElement('p');
      accession.className = 'evidence-accession';
      accession.textContent = model.accessionLine;

      const meta = document.createElement('dl');
      meta.className = 'evidence-meta';
      if (model.materials) meta.append(...field('Materials', model.materials));
      if (model.citedAt) meta.append(...field('Packet prepared / cited', model.citedAt));
      meta.append(...field('Interpretive status', model.claimType || 'INFERENCE'));

      const established = listBlock(
        'ESTABLISHED in this public packet',
        model.established.length ? model.established : ['(none listed)'],
        'evidence-block--established'
      );
      const inference = listBlock(
        'INFERENCE (interpretive reading)',
        model.inference.length ? model.inference : ['(no claim selected)'],
        'evidence-block--inference'
      );

      const supportItems = model.supportingEvidence.length
        ? model.supportingEvidence.map((row) =>
            row.sourceRef ? `${row.text} (${row.sourceRef})` : row.text
          )
        : ['(no cited observations attached to this reading)'];
      const support = listBlock(
        'Supporting observations from packet fields',
        supportItems,
        'evidence-block--support'
      );

      const unknown = listBlock(
        'NOT ESTABLISHED in this public packet',
        model.notEstablished.length ? model.notEstablished : ['(none listed)'],
        'evidence-block--unknown'
      );

      const note = document.createElement('p');
      note.className = 'evidence-note';
      note.textContent = model.note;

      const link = document.createElement('p');
      if (model.publicRecordUrl) {
        const a = document.createElement('a');
        a.href = model.publicRecordUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'Public source record';
        link.append(a);
      }

      const actions = document.createElement('div');
      actions.className = 'inspector__actions';
      actions.append(makeTextButton('Residency question', handlers.onResidency));
      appendExploreAction(actions, world);
      actions.append(makeTextButton('Return to encounter', handlers.onReturnWorld));

      panel.append(h2, accession, meta, established, inference, support, unknown, note);
      if (model.onsiteQuestion) {
        const q = document.createElement('p');
        q.className = 'evidence-onsite';
        const strong = document.createElement('strong');
        strong.textContent = 'Onsite question';
        q.append(strong, document.createTextNode(` ${model.onsiteQuestion}`));
        panel.append(q);
      }
      panel.append(link, actions);
    }

    if (world.stage === 'residency' && world.residency) {
      const item = world.residency;
      const h2 = document.createElement('h2');
      h2.textContent = 'Residency';
      panel.setAttribute('aria-label', 'Residency research question');
      const dl = document.createElement('dl');
      for (const [k, v] of [
        ['Object', `${item.title} (${item.accessionNumber})`],
        ['Why physical access matters', item.whyRequest],
        ['Generating contradiction', item.generatingContradiction],
        ['Simulation could not resolve', (item.simulationCouldNotResolve || []).join('; ')],
        ['Onsite questions', (item.onsiteQuestions || []).join(' ')]
      ]) {
        dl.append(...field(k, v));
      }
      const link = document.createElement('p');
      const a = document.createElement('a');
      a.href = item.sourceUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Official public source';
      link.append(a);
      const actions = document.createElement('div');
      actions.className = 'inspector__actions';
      appendExploreAction(actions, world);
      actions.append(makeTextButton('Return to encounter', handlers.onReturnWorld));
      panel.append(h2, dl, link, actions);
    }

    root.append(panel);
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panel.focus({ preventScroll: reduceMotion });
  }

  return {
    renderSpeech,
    renderInspector
  };
}

export { buildEvidenceViewModel };
