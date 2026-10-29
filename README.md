# おばけにおやつ

左からやってくるおばけに、道ばたへおやつを置いて満足させ、成仏させるゲーム。おばけが家に着いたらゲームオーバー、残り時間が0秒になればクリア。

Vite + TypeScript + Tailwind CSS で動く（React・バックエンドなし）。

## 構成

- `src/stages/`: ステージ（1ファイル1ステージ）
- `src/stage.ts`: ステージの型と読み込み
- `src/board.ts`: 盤面のマス計算（道・届く範囲）
- `src/snacks.ts`: おやつの種類
- `src/game.ts`: DOM に依存しないゲームロジック（テスト対象）
- `src/view.ts`: DOM への描画
- `src/art.ts`: SVG 素材
- `src/main.ts`: 上をつなぐエントリポイント

## ステージの作り方

`src/stages/` にある既存のファイルをコピーして、名前を `03-<好きな名前>.ts` のように変えて中身を書きかえる。ファイル名の順番がステージの順番になる。登録の作業はいらない。

- `routes`: おばけが通る道。曲がり角の座標を順に書く。盤面は横 0〜8、縦 0〜4。分岐させたいときはルートを複数書き、最後のマス（おうち）をそろえる（`02-futamata.ts` が見本）
- `slots`: おやつの置き場。道のとなり（ななめも可）に置く
- `snacks`: 買えるおやつ（`"cookie"`、`"pudding"`、`"cotton"`）
- `seconds` / `money`: 制限時間と最初のおかね

`pnpm dev` で開いたら、`#/stages/3` のように URL の後ろに番号を付けると、そのステージを直接開ける。`pnpm test` を実行すると、道が途切れていないか、置き場が道に届くかなどをチェックできる。

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

`main` に push すると [GitHub Pages](https://ut-code.github.io/obake-oyatsu/) にデプロイされる。
