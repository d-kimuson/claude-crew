# pnpm boilerplate

## Setup Repository

```bash
git clone git@github.com:d-kimuson/claude-crew.git my-app
cd my-app
./scripts/setup_repository.sh
```

---

## セットアップ

- [direnv](https://github.com/direnv/direnv)

を事前にインストールしておく必要があります。

```bash
$ ./scripts/setup.sh
```

- apps 毎の node がインストールされる
- すべてのパッケージの依存関係がインストールされる

## 開発する

```bash
$ pnpm dev
```

ワークスペースに属するすべてのパッケージの開発サーバーを起動します。

```bash
# 単一のパッケージのみ建てたい場合
$ pnpm --filter "パッケージ名" dev
# すべてのパッケージと単一の app のみ建てたい場合
$ pnpm --filter "./packages/**" dev
$ pnpm --filter "app名" dev
```

## ビルドする

```bash
$ pnpm build
```

## linter を実行する

```bash
$ pnpm lint # チェックのみ
$ pnpm fix  # 自動修正も行う
```

## その他の開発補助ツールについて

### lefthook

- デフォルトでコミット時に差分に対してlinterの自動修正、commitizenを使った対話型でのコミットメッセージ作成、コミットメッセージのスペルチェックが行われます
- 個人的に一部の処理を無効にしたり追加したりしたい場合にはプロジェクトルートに `lefthook-local.yml` を設置して設定してください
  - 参考: https://github.com/evilmartians/lefthook/blob/master/docs/usage.md#local-config

### cspell

スペルチェックを[cspell](https://cspell.org/)で行っています。辞書にない単語が使われているとコミット時やCIで弾かれるので一括で追加したい場合には

```bash
$ pnpm fixAll:cspell
```

します。
`cspell.json` に追加された単語がスペルミスでないことを確認してからコミットしてください。
