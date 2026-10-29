import { key, reach } from "./board";
import type { SnackType } from "./snacks";
import type { Stage } from "./stage";

const EAT_INTERVAL = 0.6;
const DONE_LINGER = 2;

export type Snack = { type: SnackType; left: number };
export type Ghost = {
  id: number;
  route: number;
  pos: number;
  speed: number;
  size: number;
  hunger: number;
  full: number;
  cooldown: number;
  doneAt: number;
};
export type Status = "playing" | "clear" | "over";

export type Game = {
  stage: Stage;
  money: number;
  timeLeft: number;
  elapsed: number;
  spawnTimer: number;
  status: Status;
  snacks: Map<string, Snack>;
  ghosts: Ghost[];
  nextId: number;
};

export function createGame(stage: Stage): Game {
  return {
    stage,
    money: stage.money,
    timeLeft: stage.seconds,
    elapsed: 0,
    spawnTimer: 1,
    status: "playing",
    snacks: new Map(),
    ghosts: [],
    nextId: 0,
  };
}

export function placeSnack(g: Game, slot: number, type: number): boolean {
  const k = key(g.stage.slots[slot]);
  const t = g.stage.snacks[type];
  if (g.status !== "playing" || g.snacks.has(k) || g.money < t.price) return false;
  g.money -= t.price;
  g.snacks.set(k, { type: t, left: t.amount });
  return true;
}

export function spawnGhost(g: Game, rand: () => number) {
  const lv = g.elapsed / g.stage.seconds;
  // 大きいおばけほど遅くて食いしん坊にする。見た目の大きさで手強さが分かるようにするため
  const size = [0.55, 0.75, 1][Math.floor(rand() * (1 + Math.min(2, lv * 3)))];
  g.ghosts.push({
    id: g.nextId++,
    route: Math.floor(rand() * g.stage.routes.length),
    pos: 0,
    size,
    speed: (1.1 - size * 0.4) * (1 + lv),
    hunger: 0,
    full: Math.round(size * 10),
    cooldown: 0,
    doneAt: -1,
  });
}

function snackInReach(g: Game, ghost: Ghost) {
  const path = g.stage.routes[ghost.route];
  const c = path[Math.min(path.length - 1, Math.round(ghost.pos))];
  for (const [k, s] of g.snacks) {
    const [x, y] = k.split(",").map(Number);
    if (s.left > 0 && reach(c, { x, y })) return [k, s] as const;
  }
  return undefined;
}

export function step(g: Game, dt: number, rand: () => number = Math.random): Status {
  if (g.status !== "playing") return g.status;
  g.elapsed += dt;
  g.timeLeft -= dt;
  if (g.timeLeft <= 0) {
    g.timeLeft = 0;
    return (g.status = "clear");
  }
  g.spawnTimer -= dt;
  if (g.spawnTimer <= 0) {
    spawnGhost(g, rand);
    g.spawnTimer = 3.6 - (g.elapsed / g.stage.seconds) * 2;
  }

  for (const ghost of g.ghosts) {
    if (ghost.doneAt >= 0) continue;
    ghost.cooldown -= dt;
    const near = snackInReach(g, ghost);
    if (near) {
      // 食べている間は足を止める。止まらないと、たくさん食べられるおやつほど損になるため
      if (ghost.cooldown <= 0) eat(g, ghost, near[0], near[1]);
    } else {
      ghost.pos += ghost.speed * dt;
      if (ghost.pos >= g.stage.routes[ghost.route].length - 1.5) return (g.status = "over");
    }
  }
  g.ghosts = g.ghosts.filter((gh) => gh.doneAt < 0 || g.elapsed - gh.doneAt <= DONE_LINGER);
  return g.status;
}

function eat(g: Game, ghost: Ghost, k: string, s: Snack) {
  const bite = Math.min(s.type.bite, s.left, ghost.full - ghost.hunger);
  s.left -= bite;
  ghost.hunger += bite;
  ghost.cooldown = EAT_INTERVAL;
  if (s.left <= 0) g.snacks.delete(k);
  if (ghost.hunger >= ghost.full) {
    ghost.doneAt = g.elapsed;
    g.money += ghost.full;
  }
}
