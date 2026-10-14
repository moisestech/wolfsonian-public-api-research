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

export function createOverlays(root, world, handlers) {
  const speechLayer = document.createElement('div');
  speechLayer.className = 'speech-layer';
  document.querySelector('.world-canvas').append(speechLayer);

  function renderSpeech() {
    speechLayer.replaceChildren();
    if (world.stage !== 'conversation') return;
    // Max two opposed fragments — never a four-person chat stack.
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
      bubble.innerHTML = `<small>${agent.label} · INTERPRETATION</small>${agent.conversationLine}`;
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

    if (world.stage === 'claim') {
      const agent =
        world.agents.find((a) => a.id === world.activeClaimId) ||
        world.agents.find((a) => a.id === 'futurist');
      const h2 = document.createElement('h2');
      h2.textContent = 'Claim';
      const type = document.createElement('p');
      type.className = `claim-type claim-type--${agent.claimType === 'SOURCE_SUPPORTED' ? 'source' : 'inference'}`;
      type.textContent = agent.claimType;
      const dl = document.createElement('dl');
      for (const [k, v] of [
        ['Statement', agent.claim],
        ['Reader', agent.label],
        ['Grounding', world.record.title],
        ['Contradicts', agent.contradicts.join(', ') || 'Worker reading'],
        ['Uncertainty', agent.uncertainty],
        ['What would change this claim?', agent.onsiteQuestion]
      ]) {
        dl.append(...field(k, v));
      }
      const actions = document.createElement('div');
      actions.className = 'inspector__actions';
      const ev = document.createElement('button');
      ev.type = 'button';
      ev.className = 'text-button';
      ev.textContent = 'Inspect evidence';
      ev.addEventListener('click', handlers.onEvidence);
      const res = document.createElement('button');
      res.type = 'button';
      res.className = 'text-button';
      res.textContent = 'What the simulation cannot resolve';
      res.addEventListener('click', handlers.onResidency);
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'text-button';
      back.textContent = 'Return to encounter';
      back.addEventListener('click', handlers.onReturnWorld);
      actions.append(ev, res, back);
      panel.append(h2, type, dl, actions);
    }

    if (world.stage === 'evidence') {
      const agent =
        world.agents.find((a) => a.id === world.activeClaimId) ||
        world.agents.find((a) => a.id === 'futurist');
      const h2 = document.createElement('h2');
      h2.textContent = 'Evidence';
      const accession = document.createElement('p');
      accession.className = 'evidence-accession';
      accession.textContent = `${world.record.accessionNumber} · ${world.record.creator} · ${world.record.date}`;

      const established = listBlock(
        'ESTABLISHED in this public packet',
        world.record.established,
        'evidence-block--established'
      );
      const inference = listBlock(
        'INFERENCE (interpretive reading)',
        [agent.claim],
        'evidence-block--inference'
      );
      const unknown = listBlock(
        'NOT ESTABLISHED in this public packet',
        world.record.notEstablished,
        'evidence-block--unknown'
      );

      const link = document.createElement('p');
      const a = document.createElement('a');
      a.href = world.record.publicRecordUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Public source record';
      link.append(a);

      const actions = document.createElement('div');
      actions.className = 'inspector__actions';
      const res = document.createElement('button');
      res.type = 'button';
      res.className = 'text-button';
      res.textContent = 'Residency question';
      res.addEventListener('click', handlers.onResidency);
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'text-button';
      back.textContent = 'Return to encounter';
      back.addEventListener('click', handlers.onReturnWorld);
      actions.append(res, back);
      panel.append(h2, accession, established, inference, unknown, link, actions);
    }

    if (world.stage === 'residency' && world.residency) {
      const item = world.residency;
      const h2 = document.createElement('h2');
      h2.textContent = 'Residency';
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
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'text-button';
      back.textContent = 'Return to encounter';
      back.addEventListener('click', handlers.onReturnWorld);
      actions.append(back);
      panel.append(h2, dl, link, actions);
    }

    root.append(panel);
    panel.focus({ preventScroll: true });
  }

  return {
    renderSpeech,
    renderInspector
  };
}
