import { loadStage, type Stage, type StageData } from "./stage";

// ステージファイルは stage.ts を import するので、一覧を stage.ts に置くと循環 import になる。そのため別ファイルにする
// src/stages/ のファイルを自動で集める。一覧に手で登録させると、追加し忘れてステージが出てこない事故が起きるため
const modules = import.meta.glob<{ default: StageData }>("./stages/*.ts", { eager: true });
export const STAGES: Stage[] = Object.keys(modules)
  .toSorted()
  .map((k) => loadStage(modules[k].default));
