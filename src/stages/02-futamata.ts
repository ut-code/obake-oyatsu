import { defineStage } from "../stage";

// 分岐ルートの書き方の見本。上の道と下の道に分かれ、おうちの手前で合流する
export default defineStage({
  name: "ふたまたの みち",
  author: "tknkaa",
  routes: [
    [
      { x: 0, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 0 },
      { x: 6, y: 0 },
      { x: 6, y: 2 },
      { x: 8, y: 2 },
    ],
    [
      { x: 0, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 4 },
      { x: 6, y: 4 },
      { x: 6, y: 2 },
      { x: 8, y: 2 },
    ],
  ],
  slots: [
    { x: 1, y: 1 },
    { x: 4, y: 1 },
    { x: 4, y: 3 },
    { x: 7, y: 1 },
    { x: 7, y: 3 },
  ],
  snacks: ["cookie", "pudding"],
  seconds: 90,
  money: 150,
});
