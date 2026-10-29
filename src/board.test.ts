import { describe, expect, it } from "vitest";
import { buildPath, pathPoint, reach } from "./board";

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
    const path = buildPath([
      { x: 0, y: 1 },
      { x: 2, y: 1 },
    ]);
    expect(pathPoint(path, 0.5)).toEqual({ x: 0.5, y: 1 });
    expect(pathPoint(path, 10)).toEqual({ x: 2, y: 1 });
  });
});
