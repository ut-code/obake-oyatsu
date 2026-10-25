import { describe, expect, it } from "vitest";
import { HOUSE, PATH, SLOTS, buildPath, key, pathPoint, reach } from "./board";

describe("buildPath", () => {
  it("角をつないで1マスずつの道にする", () => {
    expect(
      buildPath([
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
    ]);
  });
});

describe("盤面", () => {
  it("道は途切れず隣接マスでつながっている", () => {
    for (let i = 1; i < PATH.length; i++) {
      const a = PATH[i - 1],
        b = PATH[i];
      expect(Math.abs(a.x - b.x) + Math.abs(a.y - b.y)).toBe(1);
    }
  });

  it("家は道の終点にある", () => {
    expect(HOUSE).toEqual({ x: 8, y: 1 });
  });

  it("置き場は道と重ならず、どれも道に届く", () => {
    const path = new Set(PATH.map(key));
    for (const s of SLOTS) {
      expect(path.has(key(s))).toBe(false);
      expect(PATH.some((c) => reach(s, c))).toBe(true);
    }
  });
});

describe("reach", () => {
  it("斜めを含む周囲8マスだけ届く", () => {
    expect(reach({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe(true);
    expect(reach({ x: 0, y: 0 }, { x: 0, y: 1 })).toBe(true);
    expect(reach({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(false);
    expect(reach({ x: 0, y: 0 }, { x: 2, y: 0 })).toBe(false);
  });
});

describe("pathPoint", () => {
  it("マスの間を補間する", () => {
    expect(pathPoint(0.5)).toEqual({ x: 0.5, y: 1 });
    expect(pathPoint(PATH.length + 10)).toEqual(HOUSE);
  });
});
