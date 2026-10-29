import "./style.css";
import { createGame, placeSnack, step, type Game } from "./game";
import { STAGES } from "./stage-list";
import { createView, type Ui } from "./view";

let game: Game | undefined;
const ui: Ui = { selectedType: 0, selectedSlot: 0 };

const view = createView({
  onSlot(i) {
    if (!game) return;
    ui.selectedSlot = i;
    placeSnack(game, i, ui.selectedType);
    view.render(game, ui);
  },
  onCard(i) {
    if (!game) return;
    ui.selectedType = i;
    view.render(game, ui);
  },
  onStart() {
    if (!game) return;
    game = createGame(game.stage);
    view.hideMessage();
    view.render(game, ui);
  },
});

// GitHub Pages はサブパス配下の静的配信で、/stages/2 のようなパスはリロード時に 404 になる。そのためハッシュで画面を切り替える
// 後でモードを足すときは #/stages/2?mode=hard のようにクエリを付ける想定
function route() {
  const m = location.hash.match(/^#\/stages\/(\d+)/);
  const stage = m ? STAGES[Number(m[1]) - 1] : undefined;
  if (!stage) {
    game = undefined;
    view.showStageSelect(STAGES);
    return;
  }
  game = createGame(stage);
  game.status = "over";
  Object.assign(ui, { selectedType: 0, selectedSlot: 0 });
  view.setStage(stage);
  view.render(game, ui);
  view.showMessage(`${stage.name}\nおやつで まんぷくにして おうちを まもろう`, "スタート");
}
addEventListener("hashchange", route);
route();

let last = performance.now();
requestAnimationFrame(function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (game?.status === "playing") {
    const status = step(game, dt);
    view.render(game, ui);
    if (status === "clear")
      view.showMessage("ゲームクリア！\nおばけたちは まんぞくしたよ", "もういちど");
    if (status === "over")
      view.showMessage("ゲームオーバー\nおばけが おうちに ついちゃった", "もういちど");
  }
  requestAnimationFrame(loop);
});
