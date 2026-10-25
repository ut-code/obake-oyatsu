export type Cell = { x: number; y: number };

export const TILE = 96;

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

export const PATH = buildPath([
  { x: 0, y: 1 },
  { x: 3, y: 1 },
  { x: 3, y: 3 },
  { x: 5, y: 3 },
  { x: 5, y: 1 },
  { x: 8, y: 1 },
]);
export const HOUSE = PATH[PATH.length - 1];

// おやつはデザイン上の決まった置き場にしか置けない。自由配置にすると画面がデザインから崩れるため
export const SLOTS: Cell[] = [
  { x: 2, y: 0 },
  { x: 7, y: 0 },
  { x: 1, y: 2 },
  { x: 4, y: 2 },
  { x: 6, y: 2 },
  { x: 4, y: 4 },
];

// 食べられる範囲は斜めも含めた周囲8マスにする。上下左右だけだと角の置き場がほぼ役に立たなくなるため
export const reach = (a: Cell, b: Cell) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) === 1;

// 道の上の連続位置をマス座標に直す。描画の補間に使う
export function pathPoint(pos: number): { x: number; y: number } {
  const i = Math.max(0, Math.min(PATH.length - 2, Math.floor(pos)));
  const f = Math.max(0, Math.min(1, pos - i));
  const a = PATH[i],
    b = PATH[i + 1];
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}
