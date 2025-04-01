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
- Docker および Docker Compose（カスタムデータベース使用時は不要）
- Node.js >= v20

## 特徴

- 🚀 対話形式の簡単セットアップ
- 🔄 Claude Desktop との円滑な統合
- 📝 Claude Projects 用の指示書自動生成
- 🛠️ プロジェクトワークフローのカスタマイズ可能なコマンド
- 🌐 多言語対応（TypeScript完全サポート、その他言語は基本的なファイル操作のみ）
- 🔍 OpenAIエンベッディングによる文脈理解の向上
- 💪 型情報を活用した高精度な TypeScript サポート
- 🔌 Docker の代わりにカスタム PostgreSQL データベースのサポート
- 🧠 プロジェクト知識を永続的に保存するメモリバンク機能

## Quick Start

### プロジェクト側のセットアップ

プロジェクトディレクトリに移動してセットアップを実行します：

```bash
cd /path/to/your-project
npx claude-crew@latest setup
```

対話形式で各種設定を入力すると、`.claude-crew` 以下に設定ファイルが生成されます。

> **Note**: Claude Crewは複数のプロジェクトで同時に利用できます。各プロジェクトごとに固有の設定が生成され、命名の衝突を防ぐため、それぞれのプロジェクトで独自のツール設定が作成されます。例えば：

```json
// プロジェクトA: /path/to/project-a/.claude-crew/mcp.json
{
  "tools": {
    "project_a_run_test": { ... },
    "project_a_check_types": { ... }
  }
}

// プロジェクトB: /path/to/project-b/.claude-crew/mcp.json
{
  "tools": {
    "project_b_run_test": { ... },
    "project_b_check_types": { ... }
  }
}
```

> **Tip**: プロジェクトの管理を容易にするため、Claude Crewを利用するプロジェクトは別のリポジトリとしてcloneすることをお勧めします。これにより、各プロジェクトの設定や状態を独立して管理できます。

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
     - プロジェクトの最新状態への更新
     - 依存関係の解決
   - LLM に以下の情報を提供：
     - プロジェクトの構造
     - 関連するソースコード
     - 関連ドキュメント
     - テスト環境の情報
     - 永続的なプロジェクト知識を格納するメモリバンク

3. **自律的なタスク実行**
   - LLM が提供された情報を基に作業を開始
     - リンターによるコード品質チェック
     - ユニットテストの実行
     - 型チェックの実行
   - フィードバック結果を基に必要な修正を実施

各ステップで得られる情報は最適化され、LLM のコンテキストウィンドウを効率的に使用します。

## 設定項目

`.claude-crew/config.json` で以下の設定をカスタマイズできます：

| カテゴリ         | 設定項目                    | デフォルト値                                                           | 説明                                                                     |
| ---------------- | --------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **基本設定**     |
|                  | `name`                      | プロジェクト名                                                         | プロジェクト名                                                           |
|                  | `directory`                 | カレントディレクトリ                                                   | プロジェクトのルートディレクトリ                                         |
|                  | `language`                  | "日本語"                                                               | Claude との対話言語                                                      |
| **コマンド**     |
|                  | `commands.install`          | "pnpm i"                                                               | 依存関係のインストールコマンド                                           |
|                  | `commands.build`            | "pnpm build"                                                           | ビルドコマンド                                                           |
|                  | `commands.test`             | "pnpm test"                                                            | テスト実行コマンド                                                       |
|                  | `commands.testFile`         | "pnpm vitest run <file>"                                               | 単一ファイルのテストコマンド。<file> が絶対パスに置換されます。          |
|                  | `commands.checks`           | ["pnpm tsc -p . --noEmit"]                                             | 型チェックなどの検証コマンド                                             |
|                  | `commands.checkFiles`       | ["pnpm eslint <files>"]                                                | 特定ファイルの検証コマンド。<files>が絶体パスの一覧に置換されます。      |
| **データベース** |
|                  | `database.url`              | "postgresql://postgres:postgres@127.0.0.1:6432/claude-crew-embeddings" | PostgreSQL接続URL。customDbがtrueの場合は自前のDB URLを指定します        |
|                  | `database.port`             | 6432                                                                   | 内蔵Docker DB用ポート番号（customDbがtrueの場合は無視されます）          |
|                  | `database.customDb`         | false                                                                  | trueに設定するとDockerの代わりに自前のPostgreSQLデータベースを使用します |
| **Embedding**    |
|                  | `embedding.provider.type`   | "openai"                                                               | エンベディングプロバイダーの種類                                         |
|                  | `embedding.provider.apiKey` | -                                                                      | OpenAI API キー                                                          |
|                  | `embedding.provider.model`  | "text-embedding-ada-002"                                               | OpenAI エンベディングモデル                                              |

## メモリバンク

Claude Crew では`.claude-crew/memory-bank.md`ファイルを作成し、プロジェクトの永続的な知識を保存します。このファイルは各タスクの開始時に自動的に読み込まれ、以下のセクションが含まれています：

- プロジェクト概要
- プロダクトコンテキスト
- システムパターン
- コーディングガイドライン

メモリバンクはプロジェクト開発全体を通じて更新され、AIエージェントのための知識リポジトリとして機能します。

## CLIコマンド

Claude Crewは以下のCLIコマンドを提供します：

- `setup` - インタラクティブなプロジェクトセットアップ
- `setup-db` - データベースを手動でセットアップ（再インストール時に便利）
- `clean` - Dockerコンテナとボリュームを削除してセットアップ前の状態にリセット
- `serve-mcp` - Claude Desktop連携用のMCPサーバーを実行

## コントリビューション

コントリビューションは大歓迎です！以下の方法で参加できます：

- バグ報告や機能要望は Issue で
- 改善案は Pull Request で

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。
