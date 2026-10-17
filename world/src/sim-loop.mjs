import { SILENT_HOLD_SECONDS } from './world-logic.mjs';

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
      if (d > 0 && d < 56) {
        const push = (56 - d) * 0.1;
        a.x -= ((b.x - a.x) / d) * push;
        a.y -= ((b.y - a.y) / d) * push;
      }
    }
  }
}

function wanderOffset(time, seed) {
  return {
    x: Math.sin(time * 0.55 + seed) * 14,
    y: Math.cos(time * 0.4 + seed * 1.7) * 10
  };
}

const WORLD_SEED = {
  worker: 2.4,
  futurist: 0.3
};

const SPEEDS = {
  futurist: 76,
  worker: 58
};

const START_HOME = {
  futurist: { x: 280, y: 90 },
  worker: { x: 920, y: 620 }
};

export function tickSimulation(world, dt) {
  world.simulationTime += dt;
  const t = world.simulationTime;
  const radio = world.radio;
  const frozen = world.stage === 'claim' || world.stage === 'evidence' || world.stage === 'residency';

  if (world.reducedMotion) {
    for (const agent of world.agents) {
      const station = world.stations[agent.id];
      agent.x = station.x;
      agent.y = station.y;
      agent.state = 'observing';
      agent.attentionTarget = 'radio';
    }
    if (world.stage === 'world' && t > 0.15) world.stage = 'encounter';
    if (!world.contradiction.active && t > 1.2) {
      world.contradiction.active = true;
      world.contradiction.formedAt = t;
      world.contradiction.selectable = true;
      world.archivistConstraint.tension = 1;
    }
    // Conversation is never auto-entered — contradiction click required.
    return;
  }

  if (frozen) {
    for (const agent of world.agents) {
      agent.vx = 0;
      agent.vy = 0;
    }
    return;
  }

  for (const agent of world.agents) {
    if (agent.id === 'futurist') {
      if (t < 1.4) {
        const home = wanderOffset(t, WORLD_SEED.futurist);
        agent.destination = { x: START_HOME.futurist.x + home.x, y: START_HOME.futurist.y + home.y };
        agent.state = 'wandering';
      } else {
        agent.destination = world.stations.futurist;
        agent.state = dist(agent, world.stations.futurist) > 14 ? 'approaching' : 'observing';
        agent.attentionTarget = 'radio';
      }
    }

    if (agent.id === 'worker') {
      if (t < 2.8) {
        const home = wanderOffset(t, WORLD_SEED.worker);
        agent.destination = { x: START_HOME.worker.x + home.x, y: START_HOME.worker.y + home.y };
        agent.state = 'wandering';
      } else {
        agent.destination = world.stations.worker;
        agent.state = dist(agent, world.stations.worker) > 14 ? 'approaching' : 'observing';
        agent.attentionTarget = 'radio';
      }
    }

    const d = steerToward(agent, agent.destination, SPEEDS[agent.id], dt);
    if (d < 10 && agent.state === 'approaching') agent.state = 'observing';
  }

  separate(world.agents);

  const futurist = world.agents.find((a) => a.id === 'futurist');
  const worker = world.agents.find((a) => a.id === 'worker');
  const bothObserving =
    futurist?.state === 'observing' &&
    worker?.state === 'observing' &&
    dist(futurist, world.stations.futurist) < 20 &&
    dist(worker, world.stations.worker) < 20;

  if (world.stage === 'world' && futurist && dist(futurist, radio) < 160) {
    world.stage = 'encounter';
  }

  if (bothObserving) {
    if (!world._oppositionSince) world._oppositionSince = t;
    const held = t - world._oppositionSince;
    world.archivistConstraint.tension = Math.min(1, held / SILENT_HOLD_SECONDS);

    if (!world.contradiction.active && held >= SILENT_HOLD_SECONDS) {
      world.contradiction.active = true;
      world.contradiction.formedAt = t;
      world.contradiction.selectable = true;
      world.archivistConstraint.tension = 1;
      world.archivistConstraint.pulse = 1;
    }
  } else {
    world._oppositionSince = null;
    if (!world.contradiction.active) {
      world.archivistConstraint.tension = Math.max(0, world.archivistConstraint.tension - dt * 0.2);
    }
  }

  if (world.archivistConstraint.pulse > 0) {
    world.archivistConstraint.pulse = Math.max(0, world.archivistConstraint.pulse - dt * 0.35);
  }

  // Intentionally no auto-advance to conversation — stamp must be selected.
}

export function advanceWorld(world, dt) {
  tickSimulation(world, dt);
  return world;
}

export function stepBack(world) {
  const order = ['world', 'encounter', 'conversation', 'claim', 'evidence', 'residency'];
  const i = order.indexOf(world.stage);
  if (i <= 0) return;
  world.stage = order[i - 1];
  if (world.stage === 'world' || world.stage === 'encounter') {
    world.activeClaimId = null;
    world.conversationLine = null;
  }
  if (world.stage === 'encounter' || world.stage === 'world') {
    world.spokenIndex = -1;
  }
}

export function setStage(world, stage) {
  world.stage = stage;
  if (stage === 'conversation' && world.spokenIndex < 0) world.spokenIndex = 0;
}
