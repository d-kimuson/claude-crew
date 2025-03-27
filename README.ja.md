# Claude Crew 🤖

[![npm version](https://badge.fury.io/js/claude-crew.svg)](https://badge.fury.io/js/claude-crew)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | 日本語

Claude Crew は、Claude Desktop と Model Context Protocol (MCP) を活用して、OpenHands のような自律的なコーディングエージェントを作成するためのツールです。Cline 等のリアルタイムでの協業を重視するコーディングアシスタントとは異なり、タスクを自律的に処理できるエージェントの実現を目指しています。

## コンセプト

Claude Crew は、LLM の性能を最大限に引き出すために、以下の3つの要素に注力しています：

- 🎯 コンテキストウィンドウの効率的な利用によるコスト効率の最大化
- 🧪 ブラウザ連携ではなくユニットテストによるトークンコストパフォーマンスに長けた動作検証を重視
- 🔄 汎用的なファイルシステム操作・シェルの MCP ではなく、プロジェクトに最適化された MCP 及びコンテキスト情報の提供

## 必要要件

- Claude Desktop
- Embedding 用の OpenAI API キー
- Docker および Docker Compose
- Node.js >= v20

## 特徴

- 🚀 対話形式の簡単セットアップ
- 🔄 Claude Desktop との円滑な統合
- 📝 Claude Projects 用の指示書自動生成
- 🛠️ プロジェクトワークフローのカスタマイズ可能なコマンド
- 🌐 多言語対応（TypeScript完全サポート、その他言語は基本的なファイル操作のみ）
- 🔍 ローカルエンベッディングによる文脈理解の向上
- 💪 型情報を活用した高精度な TypeScript サポート

## Quick Start

### プロジェクト側のセットアップ

プロジェクトディレクトリに移動してセットアップを実行します：

```bash
cd /path/to/your-project
npx claude-crew setup
```

対話形式で各種設定を入力すると、`.claude-crew` 以下に設定ファイルが生成されます。

### Claude Desktop のセットアップ

1. `.claude-crew/mcp.json` に生成された MCP の設定を `~/Library/Application Support/Claude/claude_desktop_config.json` に追加します
2. Claude Desktop を起動し、Projects を新規で作成します
3. `.claude-crew/instruction.md` の内容をプロジェクトのカスタム指示に追加します

以上でセットアップ完了です 🎉

## How it works

Claude Crew は以下のような流れでタスクを処理します：

1. **タスクの受付**

   - ユーザーからタスクの依頼を受け取る

2. **プロジェクト情報の提供**

   - `prepare` ツールが自動的に呼び出され：
     - 作業用ブランチの作成
     - プロジェクトの最新状態への更新
     - 依存関係の解決
   - LLM に以下の情報を提供：
     - プロジェクトの構造
     - 関連するソースコード
     - 関連ドキュメント
     - テスト環境の情報

3. **自律的なタスク実行**
   - LLM が提供された情報を基に作業を開始
   - ファイル操作時に自動的に：
     - リンターによるコード品質チェック
     - ユニットテストの実行
     - 型チェックの実行
   - フィードバック結果を基に必要な修正を実施
   - コミットの作成とプルリクエストの提案

各ステップで得られる情報は最適化され、LLM のコンテキストウィンドウを効率的に使用します。

## 設定項目

`.claude-crew/config.json` で以下の設定をカスタマイズできます：

| カテゴリ         | 設定項目                   | デフォルト値                                                           | 説明                                                                  |
| ---------------- | -------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **基本設定**     |
|                  | `name`                     | プロジェクト名                                                         | プロジェクト名                                                        |
|                  | `directory`                | カレントディレクトリ                                                   | プロジェクトのルートディレクトリ                                      |
|                  | `language`                 | "日本語"                                                               | Claude との対話言語                                                   |
| **コマンド**     |
|                  | `commands.install`         | "pnpm i"                                                               | 依存関係のインストールコマンド                                        |
|                  | `commands.build`           | "pnpm build"                                                           | ビルドコマンド                                                        |
|                  | `commands.test`            | "pnpm test"                                                            | テスト実行コマンド                                                    |
|                  | `commands.testFile`        | "pnpm vitest run <file>"                                               | 単一ファイルのテストコマンド。<file> が絶対パスに置換されます。       |
|                  | `commands.checks`          | ["pnpm tsc -p . --noEmit"]                                             | 型チェックなどの検証コマンド                                          |
|                  | `commands.checkFiles`      | ["pnpm eslint <files>"]                                                | 特定ファイルの検証コマンド。<files>が絶体パスの一覧に置換されます。   |
| **Git設定**      |
|                  | `git.defaultBranch`        | "main"                                                                 | デフォルトブランチ名                                                  |
|                  | `git.branchPrefix`         | "claude-crew/"                                                         | 作業ブランチのプレフィックス                                          |
| **GitHub設定**   |
|                  | `github.createPullRequest` | "draft"                                                                | PRの作成方法（always/draft/never）                                    |
| **データベース** |
|                  | `database.url`             | "postgresql://postgres:postgres@127.0.0.1:6432/claude-crew-embeddings" | PostgreSQL接続URL。カスタムDBを利用しない場合は変更しないでください。 |
|                  | `database.port`            | 6432                                                                   | ポート番号                                                            |
|                  | `database.customDb`        | false                                                                  | カスタムDB使用フラグ                                                  |
| **Embedding**    |
|                  | `embedding.openAiKey`      | -                                                                      | OpenAI API キー（必須）                                               |

## コントリビューション

コントリビューションは大歓迎です！以下の方法で参加できます：

- バグ報告や機能要望は Issue で
- 改善案は Pull Request で

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。
