import { describe, expect, it } from "vitest";
import { COLS, ROWS, key, reach } from "./board";
import { STAGES } from "./stage-list";

// メンバーが追加したステージの書き間違いを、遊ぶ前に pnpm test で見つけられるようにする
describe.each(STAGES.map((s, i) => [`${i + 1}. ${s.name}`, s] as const))("%s", (_, stage) => {
  const onPath = new Set(stage.routes.flat().map(key));

  it("道は盤面の中にある", () => {
    for (const c of stage.routes.flat()) {
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.x).toBeLessThan(COLS);
      expect(c.y).toBeGreaterThanOrEqual(0);
      expect(c.y).toBeLessThan(ROWS);
    }
  });

  it("ルートは途切れず隣のマスでつながっている（曲がり角はたて・よこにそろえる）", () => {
    for (const route of stage.routes)
      for (let i = 1; i < route.length; i++) {
        const a = route[i - 1],
          b = route[i];
        expect(Math.abs(a.x - b.x) + Math.abs(a.y - b.y)).toBe(1);
      }
  });

  it("どのルートも同じおうちで終わる", () => {
    for (const route of stage.routes) expect(route[route.length - 1]).toEqual(stage.house);
  });

  it("置き場は道と重ならず、盤面の中にあり、どれも道に届く", () => {
    for (const s of stage.slots) {
      expect(onPath.has(key(s))).toBe(false);
      expect(s.x >= 0 && s.x < COLS && s.y >= 0 && s.y < ROWS).toBe(true);
      expect(stage.routes.flat().some((c) => reach(s, c))).toBe(true);
    }
  });

  it("置き場が重なっていない", () => {
    expect(new Set(stage.slots.map(key)).size).toBe(stage.slots.length);
  });

  it("おやつが1つ以上買える", () => {
    expect(stage.snacks.length).toBeGreaterThan(0);
  });
});
