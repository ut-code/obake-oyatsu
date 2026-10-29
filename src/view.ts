import { EMPTY_SLOT, ghostSvg, houseSvg } from "./art";
import { TILE, key, pathPoint, reach } from "./board";
import type { Game, Ghost } from "./game";
import type { Stage } from "./stage";

const PATH_TILE =
  "absolute size-24 border-[1.5px] border-dashed border-path-dash bg-path data-[range=true]:bg-range [&_svg]:size-full";

const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;

function setHtml(el: HTMLElement, html: string) {
  // 毎フレーム innerHTML を差し替えると SVG が作り直されて重くなるため、変化したときだけ書き換える
  if (el.dataset.html !== html) {
    el.innerHTML = html;
    el.dataset.html = html;
  }
}

export type Ui = { selectedType: number; selectedSlot: number };

export function createView(handlers: {
  onSlot: (i: number) => void;
  onCard: (i: number) => void;
  onStart: () => void;
}) {
  const screen = $("#screen"),
    board = $("#board"),
    shop = $("#shop"),
    overlay = $("#overlay");

  const fit = () => {
    const s = Math.min(innerWidth / 1280, innerHeight / 720);
    screen.style.transform = `scale(${s}) translate(-50%, -50%)`;
  };
  addEventListener("resize", fit);
  fit();

  const tile = (x: number, y: number, className: string) => {
    const t = document.createElement("div");
    t.className = className;
    t.style.left = `${x * TILE}px`;
    t.style.top = `${y * TILE}px`;
    board.append(t);
    return t;
  };

  const pathTiles = new Map<string, HTMLDivElement>();
  let slotTiles: HTMLDivElement[] = [];
  let cards: HTMLButtonElement[] = [];
  const ghostEls = new Map<number, HTMLDivElement>();

  // ステージごとに道や置き場の数が違うため、盤面とお店はステージを選ぶたびに作り直す
  function setStage(stage: Stage) {
    board.replaceChildren();
    shop.replaceChildren();
    pathTiles.clear();
    ghostEls.clear();
    const { house } = stage;
    // 分岐ルートは途中のマスを共有するので、同じマスを二重に描かないようにまとめる
    for (const route of stage.routes)
      for (const c of route)
        if (key(c) !== key(house) && !pathTiles.has(key(c)))
          pathTiles.set(key(c), tile(c.x, c.y, PATH_TILE));
    tile(house.x, house.y, PATH_TILE).innerHTML = houseSvg;
    const label = document.createElement("div");
    label.className = "absolute rounded-full bg-bg px-2.5 py-0.5 text-[13px]";
    label.textContent = "おうち";
    label.style.cssText = `left:${house.x * TILE + 26}px;top:${house.y * TILE + 74}px`;
    board.append(label);

    slotTiles = stage.slots.map((c, i) => {
      const t = tile(
        c.x,
        c.y,
        "absolute size-24 cursor-pointer bg-slot data-[selected=true]:outline-4 data-[selected=true]:-outline-offset-4 data-[selected=true]:outline-yellow [&_svg]:size-full",
      );
      t.addEventListener("click", () => handlers.onSlot(i));
      return t;
    });

    cards = stage.snacks.map((s, i) => {
      const b = document.createElement("button");
      b.className =
        "group flex flex-1 cursor-pointer items-center gap-4 rounded-2xl border-2 border-transparent bg-card px-[18px] text-left data-[poor=true]:opacity-50 data-[selected=true]:border-yellow data-[selected=true]:bg-panel";
      b.innerHTML = `<div class="size-21 flex-none rounded-[14px] bg-slot group-data-[selected=true]:bg-transparent [&_svg]:size-full">${s.svg}</div><div><div class="text-[22px] tracking-widest">${s.name}</div><div class="mt-2.5 mb-1.5 text-lg text-yellow">${s.price}円</div><div class="flex items-center gap-1 text-xs text-sub">まんぷく ${[1, 2, 3].map((n) => `<i class="inline-block size-[13px] rounded-full ${n <= s.level ? "bg-pink" : "bg-dot"}"></i>`).join("")}</div></div>`;
      b.addEventListener("click", () => handlers.onCard(i));
      shop.append(b);
      return b;
    });
  }

  $("#start").addEventListener("click", handlers.onStart);

  function drawGhost(g: Game, gh: Ghost) {
    let el = ghostEls.get(gh.id);
    if (!el) {
      el = document.createElement("div");
      el.className = "pointer-events-none absolute [&>svg]:size-full [&>svg]:overflow-visible";
      board.append(el);
      ghostEls.set(gh.id, el);
    }
    const p = pathPoint(g.stage.routes[gh.route], gh.pos);
    const px = (p.x + 0.5) * TILE,
      py = (p.y + 0.5) * TILE;
    const w = TILE * 0.8 * gh.size;
    const bob = Math.sin(g.elapsed * 4 + gh.size * 7) * 3;
    const t = gh.doneAt >= 0 ? g.elapsed - gh.doneAt : 0;
    el.style.cssText = `left:${px - w / 2}px;top:${py - w / 2 + bob - t * 20}px;width:${w}px;height:${w}px;opacity:${1 - Math.max(0, t - 1)}`;
    setHtml(
      el,
      ghostSvg(gh.id, gh.hunger, gh.full) +
        (gh.doneAt >= 0
          ? `<div class="absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-cream px-3 py-1 text-sm text-ink" style="left:${w / 2}px;top:-40px">ごちそうさま！</div><div class="absolute whitespace-nowrap rounded-full bg-bg px-2 py-0.5 text-xs" style="left:${w - 6}px;top:-4px">+${gh.full}円</div><span class="absolute text-base text-pink" style="left:-12px;top:-14px">❤</span><span class="absolute text-base text-pink" style="left:${w + 8}px;top:-22px;font-size:12px">❤</span>`
          : ""),
    );
  }

  function render(g: Game, ui: Ui) {
    $("#money").textContent = String(g.money);
    $("#time").textContent = String(Math.ceil(g.timeLeft));
    const { slots, snacks } = g.stage;
    const t = snacks[ui.selectedType];
    $("#desc-name").textContent = t.name;
    $("#desc-text").textContent = t.desc;
    cards.forEach((c, i) => {
      c.dataset.selected = String(i === ui.selectedType);
      c.dataset.poor = String(g.money < snacks[i].price);
    });
    slotTiles.forEach((el, i) => {
      const s = g.snacks.get(key(slots[i]));
      el.dataset.selected = String(i === ui.selectedSlot && !!s);
      setHtml(el, s ? s.type.svg : EMPTY_SLOT);
      el.style.opacity = s ? String(0.45 + 0.55 * (s.left / s.type.amount)) : "1";
    });
    const sel = slots[ui.selectedSlot];
    const showRange = g.snacks.has(key(sel));
    for (const [k, el] of pathTiles) {
      const [x, y] = k.split(",").map(Number);
      el.dataset.range = String(showRange && reach(sel, { x, y }));
    }
    const alive = new Set(g.ghosts.map((gh) => gh.id));
    for (const [id, el] of ghostEls)
      if (!alive.has(id)) {
        el.remove();
        ghostEls.delete(id);
      }
    for (const gh of g.ghosts) drawGhost(g, gh);
  }

  function showMessage(text: string, button: string) {
    $("#message").textContent = text;
    $("#start").textContent = button;
    $("#start").hidden = false;
    $("#to-select").hidden = false;
    $("#stage-list").hidden = true;
    overlay.hidden = false;
  }

  function showStageSelect(stages: Stage[]) {
    $("#message").textContent = "ステージを えらぼう";
    $("#start").hidden = true;
    $("#to-select").hidden = true;
    const list = $("#stage-list");
    // ステージはリンクにする。URL で直接ステージを開けるようにして、作った人が自分のステージをすぐ試せるようにするため
    list.innerHTML = stages
      .map(
        (st, i) =>
          `<a href="#/stages/${i + 1}" class="rounded-2xl bg-card px-6 py-4 text-center no-underline text-text hover:bg-panel"><div class="text-2xl">${i + 1}. ${st.name}</div><div class="mt-1 text-sm text-sub">つくったひと: ${st.author}</div></a>`,
      )
      .join("");
    list.hidden = false;
    overlay.hidden = false;
  }

  function hideMessage() {
    overlay.hidden = true;
  }

  return { setStage, render, showMessage, showStageSelect, hideMessage };
}
