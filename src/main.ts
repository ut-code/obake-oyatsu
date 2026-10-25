import './style.css'

const TILE = 96
const GAME_SECONDS = 90
const START_MONEY = 120

type Cell = { x: number; y: number }
const key = (c: Cell) => `${c.x},${c.y}`

const CORNERS: Cell[] = [{ x: 0, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 1 }, { x: 8, y: 1 }]
const PATH: Cell[] = []
for (let i = 0; i < CORNERS.length - 1; i++) {
  const a = CORNERS[i], b = CORNERS[i + 1]
  const dx = Math.sign(b.x - a.x), dy = Math.sign(b.y - a.y)
  for (let c = { ...a }; c.x !== b.x || c.y !== b.y; c = { x: c.x + dx, y: c.y + dy }) PATH.push(c)
}
PATH.push(CORNERS[CORNERS.length - 1])
const HOUSE = PATH[PATH.length - 1]

// おやつはデザイン上の決まった置き場にしか置けない。自由配置にすると画面がデザインから崩れるため
const SLOTS: Cell[] = [{ x: 2, y: 0 }, { x: 7, y: 0 }, { x: 1, y: 2 }, { x: 4, y: 2 }, { x: 6, y: 2 }, { x: 4, y: 4 }]

const cookieSvg = `<svg viewBox="0 0 96 96"><ellipse cx="48" cy="70" rx="28" ry="7" fill="#fff8e8"/><circle cx="48" cy="48" r="23" fill="#d9a05b"/><circle cx="48" cy="48" r="23" fill="none" stroke="#c58a46" stroke-width="2"/><g fill="#8a5a2b"><circle cx="40" cy="40" r="2.6"/><circle cx="55" cy="42" r="2.6"/><circle cx="45" cy="55" r="2.6"/><circle cx="58" cy="56" r="2.2"/><circle cx="50" cy="33" r="2"/></g></svg>`
const puddingSvg = `<svg viewBox="0 0 96 96"><ellipse cx="48" cy="66" rx="28" ry="8" fill="#fff8e8"/><path d="M34 38 L62 38 L68 66 L28 66 Z" fill="#ffc94d"/><path d="M34 38 Q48 30 62 38 L63 44 Q48 40 33 44 Z" fill="#c9772b"/><circle cx="48" cy="29" r="5" fill="#f0607a"/><path d="M48 24 q2 -6 6 -7" stroke="#6a8a3a" stroke-width="1.5" fill="none"/><circle cx="42" cy="52" r="2" fill="#3a2d5c"/><circle cx="54" cy="52" r="2" fill="#3a2d5c"/><path d="M45 56 q3 3 6 0" stroke="#3a2d5c" stroke-width="1.6" fill="none"/></svg>`
const cottonSvg = `<svg viewBox="0 0 96 96"><rect x="46" y="50" width="4" height="28" rx="2" fill="#fff8e8"/><g fill="#ffb3cf"><circle cx="40" cy="38" r="11"/><circle cx="56" cy="38" r="11"/><circle cx="48" cy="28" r="11"/><circle cx="48" cy="46" r="11"/></g><g fill="#ffd2e2"><circle cx="44" cy="32" r="5"/></g><circle cx="44" cy="40" r="1.8" fill="#3a2d5c"/><circle cx="52" cy="40" r="1.8" fill="#3a2d5c"/></svg>`

type SnackType = { name: string; svg: string; price: number; level: number; amount: number; bite: number; desc: string }
const SNACKS: SnackType[] = [
  { name: 'クッキー', svg: cookieSvg, price: 30, level: 1, amount: 4, bite: 1, desc: 'すこし まんぷくに なるよ。' },
  { name: 'プリン', svg: puddingSvg, price: 50, level: 2, amount: 8, bite: 2, desc: 'けっこう まんぷくに なるよ。' },
  { name: 'わたあめ', svg: cottonSvg, price: 80, level: 3, amount: 14, bite: 3, desc: 'とても まんぷくに なるよ。' },
]

type Snack = { type: SnackType; left: number }
type Ghost = { el: HTMLDivElement; pos: number; speed: number; size: number; hunger: number; full: number; cooldown: number; doneAt: number }

const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!
const screen = $('#screen'), board = $('#board'), shop = $('#shop'), overlay = $('#overlay')

function fit() {
  const s = Math.min(innerWidth / 1280, innerHeight / 720)
  screen.style.transform = `scale(${s}) translate(-50%, -50%)`
}
addEventListener('resize', fit)
fit()

let money = 0, timeLeft = 0, elapsed = 0, spawnTimer = 0, running = false
let selectedType = 1
let selectedSlot = 0
const snacks = new Map<string, Snack>()
let ghosts: Ghost[] = []

const pathTiles = new Map<string, HTMLDivElement>()
for (const c of PATH) {
  if (c === HOUSE) continue
  const t = document.createElement('div')
  t.className = 'tile path'
  t.style.left = `${c.x * TILE}px`
  t.style.top = `${c.y * TILE}px`
  board.append(t)
  pathTiles.set(key(c), t)
}
{
  const h = document.createElement('div')
  h.className = 'tile path'
  h.style.cssText = `left:${HOUSE.x * TILE}px;top:${HOUSE.y * TILE}px`
  h.innerHTML = `<svg viewBox="0 0 96 96"><path d="M26 46 L48 26 L70 46" fill="none" stroke="#f0607a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/><rect x="31" y="44" width="34" height="26" fill="#fff8e8" stroke="#3a2d5c" stroke-width="3"/><rect x="43" y="54" width="10" height="16" fill="#8a5a2b"/><rect x="55" y="50" width="6" height="6" fill="#ffd66b"/></svg>`
  board.append(h)
  const label = document.createElement('div')
  label.className = 'house-label'
  label.textContent = 'おうち'
  label.style.cssText = `left:${HOUSE.x * TILE + 26}px;top:${HOUSE.y * TILE + 74}px`
  board.append(label)
}

const slotTiles = SLOTS.map((c, i) => {
  const t = document.createElement('div')
  t.className = 'tile slot'
  t.style.left = `${c.x * TILE}px`
  t.style.top = `${c.y * TILE}px`
  t.onclick = () => clickSlot(i)
  board.append(t)
  return t
})

const cards = SNACKS.map((s, i) => {
  const b = document.createElement('button')
  b.className = 'card'
  b.innerHTML = `<div class="icon">${s.svg}</div><div><div class="name">${s.name}</div><div class="price">${s.price}円</div><div class="full">まんぷく ${[1, 2, 3].map((n) => `<i class="dot${n <= s.level ? ' on' : ''}"></i>`).join('')}</div></div>`
  b.onclick = () => { selectedType = i; render() }
  shop.append(b)
  return b
})

// 食べられる範囲は斜めも含めた周囲8マスにする。上下左右だけだと角の置き場がほぼ役に立たなくなるため
const reach = (a: Cell, b: Cell) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) === 1

function clickSlot(i: number) {
  selectedSlot = i
  const k = key(SLOTS[i])
  const t = SNACKS[selectedType]
  if (running && !snacks.has(k) && money >= t.price) {
    money -= t.price
    snacks.set(k, { type: t, left: t.amount })
  }
  render()
}

function render() {
  $('#money').textContent = String(money)
  $('#time').textContent = String(Math.ceil(timeLeft))
  const t = SNACKS[selectedType]
  $('#desc-name').textContent = t.name
  $('#desc-text').textContent = t.desc
  cards.forEach((c, i) => {
    c.classList.toggle('selected', i === selectedType)
    c.classList.toggle('poor', money < SNACKS[i].price)
  })
  slotTiles.forEach((el, i) => {
    const s = snacks.get(key(SLOTS[i]))
    el.classList.toggle('empty', !s)
    el.classList.toggle('selected', i === selectedSlot && !!s)
    const html = s ? s.type.svg : ''
    if (el.dataset.html !== html) { el.innerHTML = html; el.dataset.html = html }
    el.style.opacity = s ? String(0.45 + 0.55 * (s.left / s.type.amount)) : '1'
  })
  const sel = SLOTS[selectedSlot]
  const showRange = snacks.has(key(sel))
  for (const [k, el] of pathTiles) {
    const [x, y] = k.split(',').map(Number)
    el.classList.toggle('range', showRange && reach(sel, { x, y }))
  }
}

function ghostSvg(g: Ghost) {
  const ratio = Math.min(1, g.hunger / g.full)
  const done = ratio >= 1
  const body = 'M14 50 Q14 14 50 14 Q86 14 86 50 L86 88 L77 80 L68 88 L59 80 L50 88 L41 80 L32 88 L23 80 L14 88 Z'
  const id = `c${g.el.dataset.id}`
  // 満腹度ぶんだけ体を下から明るくして、あとどれくらいで成仏するかを見た目で伝える
  const fillTop = 88 - ratio * 76
  const eyes = done
    ? '<path d="M33 50 q5 -6 10 0 M57 50 q5 -6 10 0" stroke="#3a2d5c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M44 60 q6 6 12 0" stroke="#3a2d5c" stroke-width="3" fill="none" stroke-linecap="round"/>'
    : '<circle cx="38" cy="50" r="4.5" fill="#3a2d5c"/><circle cx="62" cy="50" r="4.5" fill="#3a2d5c"/><path d="M45 60 q5 4 10 0" stroke="#3a2d5c" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
  return `<svg viewBox="0 0 100 100">
    <defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs>
    ${done ? `<path d="${body}" fill="#ffd0e0" filter="drop-shadow(0 0 12px #ffe7a8)"/>` : `<path d="${body}" fill="#9a90d0"/>
    <g clip-path="url(#${id})"><rect x="0" y="${fillTop}" width="100" height="100" fill="#efeaff"/></g>
    <path d="M14 82 L23 74 L32 82 L41 74 L50 82 L59 74 L68 82 L77 74 L86 82" stroke="#e86b8a" stroke-width="2" fill="none" opacity="${ratio > 0.1 ? 1 : 0}"/>`}
    <ellipse cx="28" cy="60" rx="6" ry="3.5" fill="#ff9db5" opacity=".8"/><ellipse cx="72" cy="60" rx="6" ry="3.5" fill="#ff9db5" opacity=".8"/>
    ${eyes}
  </svg>`
}

let ghostId = 0
function spawn() {
  const lv = elapsed / GAME_SECONDS
  // 大きいおばけほど遅くて食いしん坊にする。見た目の大きさで手強さが分かるようにするため
  const size = [0.55, 0.75, 1][Math.floor(Math.random() * (1 + Math.min(2, lv * 3)))]
  const el = document.createElement('div')
  el.className = 'ghost'
  el.dataset.id = String(ghostId++)
  board.append(el)
  ghosts.push({ el, pos: 0, size, speed: (1.1 - size * 0.4) * (1 + lv), hunger: 0, full: Math.round(size * 10), cooldown: 0, doneAt: -1 })
}

function placeGhost(g: Ghost) {
  const i = Math.min(PATH.length - 2, Math.floor(g.pos))
  const f = Math.min(1, g.pos - i)
  const a = PATH[i], b = PATH[i + 1]
  const px = (a.x + (b.x - a.x) * f + 0.5) * TILE
  const py = (a.y + (b.y - a.y) * f + 0.5) * TILE
  const w = TILE * 0.8 * g.size
  const bob = Math.sin(elapsed * 4 + g.size * 7) * 3
  const t = g.doneAt >= 0 ? elapsed - g.doneAt : 0
  g.el.style.cssText = `left:${px - w / 2}px;top:${py - w / 2 + bob - t * 20}px;width:${w}px;height:${w}px;opacity:${1 - Math.max(0, t - 1)}`
  const html = ghostSvg(g) + (g.doneAt >= 0
    ? `<div class="bubble" style="left:${w / 2}px;top:-40px">ごちそうさま！</div><div class="reward" style="left:${w - 6}px;top:-4px">+${g.full}円</div><span class="heart" style="left:-12px;top:-14px">❤</span><span class="heart" style="left:${w + 8}px;top:-22px;font-size:12px">❤</span>`
    : '')
  if (g.el.dataset.html !== html) { g.el.innerHTML = html; g.el.dataset.html = html }
}

function update(dt: number) {
  elapsed += dt
  timeLeft -= dt
  if (timeLeft <= 0) { timeLeft = 0; return end('ゲームクリア！\nおばけたちは まんぞくしたよ') }
  spawnTimer -= dt
  if (spawnTimer <= 0) { spawn(); spawnTimer = 3.6 - (elapsed / GAME_SECONDS) * 2 }

  for (const g of ghosts) {
    if (g.doneAt >= 0) continue
    g.cooldown -= dt
    const c = PATH[Math.min(PATH.length - 1, Math.round(g.pos))]
    const near = [...snacks].find(([k, s]) => s.left > 0 && reach(c, SLOTS.find((sl) => key(sl) === k)!))
    if (near) {
      // 食べている間は足を止める。止まらないと、たくさん食べられるおやつほど損になるため
      if (g.cooldown <= 0) {
        const s = near[1]
        const bite = Math.min(s.type.bite, s.left, g.full - g.hunger)
        s.left -= bite
        g.hunger += bite
        g.cooldown = 0.6
        if (s.left <= 0) snacks.delete(near[0])
        if (g.hunger >= g.full) { g.doneAt = elapsed; money += g.full }
      }
    } else {
      g.pos += g.speed * dt
      if (g.pos >= PATH.length - 1.5) return end('ゲームオーバー\nおばけが おうちに ついちゃった')
    }
  }
  ghosts = ghosts.filter((g) => {
    const gone = g.doneAt >= 0 && elapsed - g.doneAt > 2
    if (gone) g.el.remove()
    return !gone
  })
  ghosts.forEach(placeGhost)
  render()
}

function start() {
  ghosts.forEach((g) => g.el.remove())
  ghosts = []
  snacks.clear()
  money = START_MONEY
  timeLeft = GAME_SECONDS
  elapsed = 0
  spawnTimer = 1
  running = true
  overlay.classList.add('hidden')
  render()
}

function end(text: string) {
  running = false
  render()
  $('#message').textContent = text
  $('#start').textContent = 'もういちど'
  overlay.classList.remove('hidden')
}

$('#start').onclick = start
$('#message').textContent = 'おばけに おやつ\nおやつで まんぷくにして おうちを まもろう'
render()

let last = performance.now()
requestAnimationFrame(function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  if (running) update(dt)
  requestAnimationFrame(loop)
})
