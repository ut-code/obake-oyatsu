# おばけにおやつ

左からやってくるおばけに、道ばたへおやつを置いて満足させ、成仏させるゲーム。おばけが家に着いたらゲームオーバー、残り時間が0秒になればクリア。

Vite + TypeScript + Tailwind CSS で動く（React・バックエンドなし）。

## 構成

- `src/board.ts`: 盤面（道・置き場・届く範囲）
- `src/snacks.ts`: おやつの種類
- `src/game.ts`: DOM に依存しないゲームロジック（テスト対象）
- `src/view.ts`: DOM への描画
- `src/art.ts`: SVG 素材
- `src/main.ts`: 上をつなぐエントリポイント

## 開発

パッケージマネージャは pnpm を使う。

```sh
pnpm install
pnpm dev
```

ビルド:

```sh
pnpm build
```

チェック（CI でも同じものを走らせている）:

```sh
pnpm lint       # oxlint
pnpm fmt:check  # oxfmt（整形するときは pnpm fmt）
pnpm typecheck  # tsrs（TypeScript 7 の Rust 移植）
pnpm test       # vitest
```

`main` に push すると GitHub Pages（https://ut-code.github.io/obake-oyatsu/）にデプロイされる。
