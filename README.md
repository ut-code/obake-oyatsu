# おばけにおやつ

左からやってくるおばけに、道ばたへおやつを置いて満足させ、成仏させるゲーム。おばけが家に着いたらゲームオーバー、残り時間が0秒になればクリア。

Vite + TypeScript のみで動く（React・バックエンドなし）。

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
```

`main` に push すると GitHub Pages（https://ut-code.github.io/obake-oyatsu/）にデプロイされる。
