import { buildPath, type Cell } from "./board";
import { SNACKS, type SnackId, type SnackType } from "./snacks";

// ステージファイルに書く内容。初心者が src/stages/ にファイルを1つ足すだけでステージを増やせるよう、ここに全部の設定を集める
export type StageData = {
  name: string;
  // おばけが通るルート。曲がり角の座標を順に書く。分岐させたいときはルートを複数書き、最後は同じおうちにそろえる
  routes: Cell[][];
  // おやつの置き場
  slots: Cell[];
  // このステージで買えるおやつ
  snacks: SnackId[];
  seconds: number;
  money: number;
};

export type Stage = {
  name: string;
  routes: Cell[][];
  house: Cell;
  slots: Cell[];
  snacks: SnackType[];
  seconds: number;
  money: number;
};

// 型注釈だけだと書き間違いのエラーが分かりにくいため、関数で受けて補完とエラー位置を出しやすくする
export const defineStage = (data: StageData) => data;

export function loadStage(data: StageData): Stage {
  const routes = data.routes.map(buildPath);
  return {
    ...data,
    routes,
    house: routes[0][routes[0].length - 1],
    snacks: data.snacks.map((id) => SNACKS[id]),
  };
}
