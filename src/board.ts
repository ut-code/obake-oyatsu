export type Cell = { x: number; y: number };

export const TILE = 96;
// 盤面は 872x488px の枠に 96px のマスを並べたもの。これを超える座標は画面からはみ出す
export const COLS = 9;
export const ROWS = 5;

export const key = (c: Cell) => `${c.x},${c.y}`;

export function buildPath(corners: Cell[]): Cell[] {
  const path: Cell[] = [];
  for (let i = 0; i < corners.length - 1; i++) {
    const a = corners[i],
      b = corners[i + 1];
    const dx = Math.sign(b.x - a.x),
      dy = Math.sign(b.y - a.y);
    for (let c = { ...a }; c.x !== b.x || c.y !== b.y; c = { x: c.x + dx, y: c.y + dy })
      path.push(c);
  }
  path.push(corners[corners.length - 1]);
  return path;
}

// 食べられる範囲は斜めも含めた周囲8マスにする。上下左右だけだと角の置き場がほぼ役に立たなくなるため
export const reach = (a: Cell, b: Cell) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) === 1;

// 道の上の連続位置をマス座標に直す。描画の補間に使う
export function pathPoint(path: Cell[], pos: number): { x: number; y: number } {
  const i = Math.max(0, Math.min(path.length - 2, Math.floor(pos)));
  const f = Math.max(0, Math.min(1, pos - i));
  const a = path[i],
    b = path[i + 1];
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}
