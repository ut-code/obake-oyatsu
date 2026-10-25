import "./style.css";
import { createGame, placeSnack, step } from "./game";
import { createView, type Ui } from "./view";

let game = createGame();
game.status = "over";
const ui: Ui = { selectedType: 1, selectedSlot: 0 };

const view = createView({
  onSlot(i) {
    ui.selectedSlot = i;
    placeSnack(game, i, ui.selectedType);
    view.render(game, ui);
  },
  onCard(i) {
    ui.selectedType = i;
    view.render(game, ui);
  },
  onStart() {
    game = createGame();
    view.hideMessage();
    view.render(game, ui);
  },
});

view.showMessage("おばけに おやつ\nおやつで まんぷくにして おうちを まもろう", "スタート");
view.render(game, ui);

let last = performance.now();
requestAnimationFrame(function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (game.status === "playing") {
    const status = step(game, dt);
    view.render(game, ui);
    if (status === "clear")
      view.showMessage("ゲームクリア！\nおばけたちは まんぞくしたよ", "もういちど");
    if (status === "over")
      view.showMessage("ゲームオーバー\nおばけが おうちに ついちゃった", "もういちど");
  }
  requestAnimationFrame(loop);
});
