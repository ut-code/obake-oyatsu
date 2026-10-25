import { describe, expect, it } from "vitest";
import { PATH } from "./board";
import { START_MONEY, createGame, placeSnack, spawnGhost, step } from "./game";
import { SNACKS } from "./snacks";

// 置き場 2 は (1,2) で、出現位置 (0,1) の斜め下にあるため、出てすぐのおばけが食べられる
const SLOT_NEAR_START = 2;
const COOKIE = 0;
const PUDDING = 1;

describe("placeSnack", () => {
  it("お金を払っておやつを置く", () => {
    const g = createGame();
    expect(placeSnack(g, 0, PUDDING)).toBe(true);
    expect(g.money).toBe(START_MONEY - SNACKS[PUDDING].price);
    expect(g.snacks.size).toBe(1);
  });

  it("埋まっている置き場には置けない", () => {
    const g = createGame();
    placeSnack(g, 0, COOKIE);
    expect(placeSnack(g, 0, COOKIE)).toBe(false);
    expect(g.money).toBe(START_MONEY - SNACKS[COOKIE].price);
  });

  it("お金が足りないと置けない", () => {
    const g = createGame();
    g.money = SNACKS[PUDDING].price - 1;
    expect(placeSnack(g, 0, PUDDING)).toBe(false);
    expect(g.snacks.size).toBe(0);
  });
});

describe("step", () => {
  it("時間切れでクリアになる", () => {
    const g = createGame();
    g.timeLeft = 0.01;
    expect(step(g, 0.05)).toBe("clear");
  });

  it("おばけが家に着くとゲームオーバーになる", () => {
    const g = createGame();
    spawnGhost(g, () => 0);
    g.ghosts[0].pos = PATH.length - 1.6;
    g.spawnTimer = 99;
    let status = step(g, 0.05);
    for (let i = 0; i < 20 && status === "playing"; i++) status = step(g, 0.05);
    expect(status).toBe("over");
  });

  it("おやつの近くでは立ち止まって食べ、満腹で成仏してお金が入る", () => {
    const g = createGame();
    g.spawnTimer = 99;
    placeSnack(g, SLOT_NEAR_START, PUDDING);
    spawnGhost(g, () => 0);
    const ghost = g.ghosts[0];
    const moneyBefore = g.money;
    for (let i = 0; i < 200 && ghost.doneAt < 0; i++) step(g, 0.05);
    expect(ghost.pos).toBe(0);
    expect(ghost.hunger).toBe(ghost.full);
    expect(g.money).toBe(moneyBefore + ghost.full);
  });

  it("食べ尽くされたおやつは消える", () => {
    const g = createGame();
    g.spawnTimer = 99;
    placeSnack(g, SLOT_NEAR_START, COOKIE);
    spawnGhost(g, () => 0.99);
    for (let i = 0; i < 200 && g.snacks.size > 0; i++) step(g, 0.05);
    expect(g.snacks.size).toBe(0);
  });

  it("終了後は進まない", () => {
    const g = createGame();
    g.status = "clear";
    const t = g.timeLeft;
    step(g, 1);
    expect(g.timeLeft).toBe(t);
  });
});
