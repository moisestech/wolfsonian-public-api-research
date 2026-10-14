export function createDomLayer(host, world, handlers) {
  const layer = document.createElement('div');
  layer.className = 'dom-layer';
  host.append(layer);

  const landmark = document.createElement('button');
  landmark.type = 'button';
  landmark.className = 'dom-landmark';
  landmark.setAttribute('aria-label', 'Select Sparton Radio record');
  landmark.innerHTML = `<img src="../demo/assets/objects/sparton-radio.svg" alt=""><span>SPARTON RADIO<br>1937</span>`;
  landmark.addEventListener('click', handlers.onRadio);
  layer.append(landmark);

  const contradiction = document.createElement('button');
  contradiction.type = 'button';
  contradiction.className = 'dom-contradiction';
  contradiction.hidden = true;
  contradiction.textContent = 'CONTRADICTION';
  contradiction.setAttribute('aria-label', 'Open contradiction for verification');
  contradiction.addEventListener('click', () => handlers.onContradiction?.());
  layer.append(contradiction);

  const tokens = new Map();
  for (const agent of world.agents) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `dom-agent dom-agent--${agent.id}`;
    button.dataset.agent = agent.id;
    button.innerHTML = `<img src="${agent.portrait}" alt=""><span class="dom-agent__name">${agent.label}</span><span class="dom-agent__role"></span>`;
    button.addEventListener('click', () => handlers.onAgent(agent.id));
    layer.append(button);
    tokens.set(agent.id, button);
  }

  function project(x, y) {
    const scale = world.stage === 'world' ? 0.72 : 1.18;
    const camX = world.stage === 'world' ? 600 : world.radio.x;
    const camY = world.stage === 'world' ? 330 : world.radio.y;
    const w = host.clientWidth || 800;
    const h = host.clientHeight || 500;
    return {
      left: w / 2 + (x - camX) * scale,
      top: h / 2 + (y - camY) * scale
    };
  }

  function render() {
    const radio = project(world.radio.x, world.radio.y);
    landmark.style.left = `${radio.left}px`;
    landmark.style.top = `${radio.top}px`;

    contradiction.hidden = !world.contradiction?.selectable;
    if (world.contradiction?.selectable) {
      contradiction.style.left = `${radio.left}px`;
      contradiction.style.top = `${radio.top - 78}px`;
    }

    for (const agent of world.agents) {
      const el = tokens.get(agent.id);
      if (!el) continue;
      const p = project(agent.x, agent.y);
      el.style.left = `${p.left}px`;
      el.style.top = `${p.top}px`;
      const role = el.querySelector('.dom-agent__role');
      role.textContent =
        world.stage === 'encounter' || world.stage === 'conversation' ? agent.attentionLabel : '';
    }
    layer.dataset.stage = world.stage;
    layer.dataset.embodied = String(world.agents.length);
  }

  return { render };
}
