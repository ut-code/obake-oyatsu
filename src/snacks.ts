import { cookieSvg, cottonSvg, puddingSvg } from "./art";

export type SnackType = {
  name: string;
  svg: string;
  price: number;
  level: number;
  amount: number;
  bite: number;
  desc: string;
};
export const SNACKS = {
  cookie: {
    name: "クッキー",
    svg: cookieSvg,
    price: 30,
    level: 1,
    amount: 4,
    bite: 1,
    desc: "すこし まんぷくに なるよ。",
  },
  pudding: {
    name: "プリン",
    svg: puddingSvg,
    price: 50,
    level: 2,
    amount: 8,
    bite: 2,
    desc: "けっこう まんぷくに なるよ。",
  },
  cotton: {
    name: "わたあめ",
    svg: cottonSvg,
    price: 80,
    level: 3,
    amount: 14,
    bite: 3,
    desc: "とても まんぷくに なるよ。",
  },
} satisfies Record<string, SnackType>;

export type SnackId = keyof typeof SNACKS;
