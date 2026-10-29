import { defineStage } from "../stage";

export default defineStage({
  name: "はじまりの みち",
  author: "tknkaa",
  routes: [
    [
      { x: 0, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 5, y: 3 },
      { x: 5, y: 1 },
      { x: 8, y: 1 },
    ],
  ],
  slots: [
    { x: 2, y: 0 },
    { x: 7, y: 0 },
    { x: 1, y: 2 },
    { x: 4, y: 2 },
    { x: 6, y: 2 },
    { x: 4, y: 4 },
  ],
  snacks: ["cookie", "pudding", "cotton"],
  seconds: 90,
  money: 120,
});
