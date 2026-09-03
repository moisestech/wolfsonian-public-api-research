function dist(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

function steerToward(agent, target, speed, dt) {
  const dx = target.x - agent.x;
  const dy = target.y - agent.y;
  const d = Math.hypot(dx, dy) || 1;
  const arrive = Math.min(1, d / 48);
  agent.vx = (dx / d) * speed * arrive;
  agent.vy = (dy / d) * speed * arrive;
  agent.x += agent.vx * dt;
  agent.y += agent.vy * dt;
  return d;
}

function separate(agents) {
  for (const a of agents) {
    for (const b of agents) {
      if (a === b) continue;
      const d = dist(a, b);
      if (d > 0 && d < 42) {
        const push = (42 - d) * 0.08;
        a.x -= ((b.x - a.x) / d) * push;
        a.y -= ((b.y - a.y) / d) * push;
      }
    }
  }
}

function wanderOffset(time, seed) {
  return {
    x: Math.sin(time * 0.55 + seed) * 18,
    y: Math.cos(time * 0.4 + seed * 1.7) * 12
  };
}

export function tickSimulation(world, dt) {
  world.simulationTime += dt;
  const t = world.simulationTime;
  const radio = world.radio;

  if (world.reducedMotion) {
    for (const agent of world.agents) {
      const station = world.stations[agent.id];
      agent.x = station.x;
      agent.y = station.y;
      agent.state = 'observing';
      agent.attentionTarget = 'radio';
    }
    if (world.stage === 'world' && t > 0.2) world.stage = 'encounter';
    return;
  }

  const speeds = {
    futurist: 78,
    propagandist: 92,
    worker: 62,
    archivist: 48
  };

  for (const agent of world.agents) {
    if (world.stage === 'claim' || world.stage === 'evidence' || world.stage === 'residency') {
      agent.vx = 0;
      agent.vy = 0;
      continue;
    }

    if (t < 2.2 && agent.id !== 'futurist') {
      const home = wanderOffset(t, WORLD_SEED[agent.id]);
      agent.destination = {
        x: agent.x * 0 + (agent.id === 'worker' ? 120 : agent.id === 'archivist' ? 1020 : 960) + home.x,
        y: (agent.id === 'worker' ? 500 : agent.id === 'archivist' ? 530 : 160) + home.y
      };
      agent.state = 'wandering';
    } else if (agent.id === 'futurist') {
      agent.destination = world.stations.futurist;
      agent.state = t < 3.4 ? 'approaching' : 'observing';
      agent.attentionTarget = 'radio';
    } else if (agent.id === 'worker' && t > 2.4) {
      agent.destination = world.stations.worker;
      agent.state = t < 5 ? 'approaching' : 'observing';
      agent.attentionTarget = 'radio';
    } else if (agent.id === 'propagandist' && t > 3.1) {
      agent.destination = world.stations.propagandist;
      agent.state = t < 5.4 ? 'approaching' : 'observing';
      agent.attentionTarget = 'radio';
    } else if (agent.id === 'archivist') {
      if (world.stage === 'conversation' || t > 7.2) {
        agent.destination = world.stations.archivist;
        agent.state = t < 9.2 ? 'challenging' : 'observing';
        agent.attentionTarget = 'radio';
      } else {
        agent.destination = { x: 1040, y: 540 };
        agent.state = 'wandering';
      }
    }

    const d = steerToward(agent, agent.destination, speeds[agent.id], dt);
    if (d < 10 && agent.state === 'approaching') agent.state = 'observing';
  }

  separate(world.agents);

  if (world.stage === 'world') {
    const futurist = world.agents.find((a) => a.id === 'futurist');
    if (dist(futurist, radio) < 130) world.stage = 'encounter';
  }
}

const WORLD_SEED = {
  archivist: 1.2,
  worker: 2.4,
  futurist: 0.3,
  propagandist: 3.1
};

export function stepBack(world) {
  const order = ['world', 'encounter', 'conversation', 'claim', 'evidence', 'residency'];
  const i = order.indexOf(world.stage);
  if (i <= 0) return;
  world.stage = order[i - 1];
  if (world.stage === 'world' || world.stage === 'encounter') {
    world.activeClaimId = null;
    world.conversationLine = null;
  }
}

export function setStage(world, stage) {
  world.stage = stage;
  if (stage === 'conversation' && world.spokenIndex < 0) world.spokenIndex = 0;
}
