# Claude Crew 🤖

[![npm version](https://badge.fury.io/js/claude-crew.svg)](https://badge.fury.io/js/claude-crew)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | 日本語

Claude Crew は、Claude Desktop と Model Context Protocol (MCP) を活用して、OpenHands のような自律的なコーディングエージェントを作成するためのツールです。

Cline 等のリアルタイムでの協業を重視するコーディングアシスタントとは異なり、LLM が自律的に開発タスクを進行します。複雑度の低いタスクを委任するようなケースや、非エンジニアが自然言語オンリーで実装を進めるケースを得意とします。

## コンセプト

Claude Crew は、Claude Desktop の性能を最大限に引き出すために、以下の3つの要素に注力しています：

- 🎯 コンテキストウィンドウの効率的な利用によるコスト効率の最大化
- 🧪 ブラウザ連携ではなくユニットテストによるトークンコストパフォーマンスに長けた動作検証を重視
- 🔄 汎用的なファイルシステム操作・シェルの MCP ではなく、プロジェクトに最適化された MCP 及びコンテキスト情報の提供

## 必要要件

- Claude Desktop
- Embedding 用の OpenAI API キー（任意 - ただしコンテキスト理解の向上のため強く推奨）
- Docker および Docker Compose（カスタムデータベース使用時は不要）
- Node.js >= v20

## How it works

Claude Crew は、設定用の CLI と MCP Server を提供します。

![](./docs/assets/claude-crew-architecture_ja.svg)

CLI を介してインタラクティブにプロジェクトの情報を設定し、プロジェクト情報を反映した MCP ツール・カスタムインストラクションを提供します。

以下のような流れでタスクを処理します：

1. **タスクの受付**

   - ユーザーからタスクの依頼を受け取る

2. **プロジェクト情報の提供**

   - `prepare` ツールが呼び出され：
     - 依存関係の更新
     - RAG インデックスの更新
   - LLM に以下の情報を提供：
     - プロジェクトの構造
     - 関連するソースコード
     - 関連ドキュメント
     - メモリバンクの知識

3. **自律的なタスク実行**
   - LLM が提供された情報を基に作業を開始
     - ファイル操作に伴い、自動的にリンター・ユニットテストが実行され、フィードバック
   - フィードバック結果を基に必要な修正を実施

各ステップで得られる情報は最適化され、LLM のコンテキストウィンドウを効率的に使用します。

## Quick Start

### プロジェクト側のセットアップ

プロジェクトディレクトリに移動してセットアップを実行します：

```bash
$ cd /path/to/your-project
$ npx claude-crew@latest setup
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

## 設定項目

`.claude-crew/config.json` で以下の設定をカスタマイズできます：

| カテゴリ         | 設定項目              | デフォルト値                                                           | 説明                                                                     |
| ---------------- | --------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **基本設定**     |
|                  | `name`                | プロジェクト名                                                         | プロジェクト名                                                           |
|                  | `directory`           | カレントディレクトリ                                                   | プロジェクトのルートディレクトリ                                         |
|                  | `language`            | "日本語"                                                               | Claude との対話言語                                                      |
| **コマンド**     |
|                  | `commands.install`    | "pnpm i"                                                               | 依存関係のインストールコマンド                                           |
|                  | `commands.build`      | "pnpm build"                                                           | ビルドコマンド                                                           |
|                  | `commands.test`       | "pnpm test"                                                            | テスト実行コマンド                                                       |
|                  | `commands.testFile`   | "pnpm vitest run <file>"                                               | 単一ファイルのテストコマンド。<file> が絶対パスに置換されます。          |
|                  | `commands.checks`     | ["pnpm tsc -p . --noEmit"]                                             | 型チェックなどの検証コマンド                                             |
|                  | `commands.checkFiles` | ["pnpm eslint <files>"]                                                | 特定ファイルの検証コマンド。<files>が絶体パスの一覧に置換されます。      |
| **データベース** |
|                  | `database.url`        | "postgresql://postgres:postgres@127.0.0.1:6432/claude-crew-embeddings" | PostgreSQL接続URL。customDbがtrueの場合は自前のDB URLを指定します        |
|                  | `database.port`       | 6432                                                                   | 内蔵Docker DB用ポート番号（customDbがtrueの場合は無視されます）          |
|                  | `database.customDb`   | false                                                                  | trueに設定するとDockerの代わりに自前のPostgreSQLデータベースを使用します |

## インテグレーション

Claude Crew は、拡張機能として複数のインテグレーションを提供しています。設定ファイルの `integrations` セクションで有効化および設定できます。

## 他のMCPツールとの協業

Claude Crew は他のMCPツールと併用することができますが、以下のガイドラインに従うことを推奨します：

### 同種のツールの無効化を推奨

`filesystem`や`claude-code`などの同種のツールは無効にすることを推奨します。

**理由：**

- 選択肢が少ないほど、AIエージェントは迷いなくタスクを進めることができます
- 重複する機能があると、AIエージェントが最適なツールを選択するのに余計なコンテキストを消費する可能性があります

### ブラウザ操作ツールの利用

`playwright-mcp`などのブラウザ操作ツールを併用することで、ブラウザアクセスを含むタスクも実行可能です。ただし、以下の点を考慮してください：

- ブラウザ操作による動作確認は、ユニットテストに比べてコンテキストを多く消費する傾向があります
- ユニットテストで十分な検証が可能な場合は、ブラウザ操作ツールの使用は非推奨です
- ユニットテストでの確認が難しい場合（例：UIの視覚的な確認、複雑なユーザーインタラクションの検証など）は、ブラウザ操作ツールの使用を検討してください

### カスタムインストラクションの追加

現時点では、他のツールの利用に関するカスタムインストラクションを自動的に統合する機能は提供されていません。

代替手段：

- CLIで生成されたインストラクション（`.claude-crew/instruction.md`）に手動で追記する
- 追加のツールに関する指示は、プロジェクトのカスタムインストラクションに直接追加してください

### 利用可能なインテグレーション

#### TypeScript インテグレーション

TypeScript プロジェクトのサポートを強化するインテグレーションです。

```json
{
  "name": "typescript",
  "config": {
    "tsConfigFilePath": "./tsconfig.json"
  }
}
```

| 設定項目           | 説明                              |
| ------------------ | --------------------------------- |
| `tsConfigFilePath` | TypeScript の設定ファイルへのパス |

**提供するツール:**

- `{project_name}-search-typescript-declaration` - 識別子（関数名、クラス名、インターフェース名など）からTypeScriptの宣言を検索

#### RAG インテグレーション (Retrieval-Augmented Generation)

プロジェクト内の関連ドキュメントや情報を検索するための拡張機能です。

```json
{
  "name": "rag",
  "config": {
    "provider": {
      "type": "openai",
      "apiKey": "your-openai-api-key",
      "model": "text-embedding-ada-002"
    }
  }
}
```

| 設定項目          | デフォルト値             | 説明                                                         |
| ----------------- | ------------------------ | ------------------------------------------------------------ |
| `provider.type`   | "openai"                 | 埋め込みプロバイダーのタイプ（現在は "openai" のみサポート） |
| `provider.apiKey` | -                        | OpenAI API キー                                              |
| `provider.model`  | "text-embedding-ada-002" | 使用する埋め込みモデル                                       |

**提供するツール:**

- `{project_name}-find-relevant-documents` - クエリに基づいて関連するドキュメントを検索
- `{project_name}-find-relevant-resources` - クエリに基づいて関連するリソースを検索

## メモリバンク

Claude Crew では`.claude-crew/memory-bank.md`ファイルを作成し、プロジェクトの永続的な知識を保存します。このファイルは各タスクの開始時に自動的に読み込まれ、以下のセクションが含まれています：

- プロジェクト概要
- プロダクトコンテキスト
- システムパターン
- コーディングガイドライン

メモリバンクはプロジェクト開発全体を通じて更新され、AIエージェントのための知識リポジトリとして機能します。

## スニペット

Claude Desktop では MCP の自動承認機能がないため、自動承認を行うためのスクリプトを提供します。必須ではなく、オプショナルです。

このスニペットは以下の機能を提供します：

### 主な機能

- **ツールの自動承認**: 信頼できるツール（`claude-crew-`で始まるツール）の実行を自動的に承認
- **メッセージ送信の制御**: 特に日本語で推奨. Ctrl+Enterでの送信を可能に（オプション）

### 使用方法

1. スニペットの生成:

```bash
# 基本的な使用方法
npx claude-crew@latest create-snippet

# Enterキーでの送信を無効化する場合
npx claude-crew@latest create-snippet --disable-send-enter

# 出力ファイルを指定する場合
npx claude-crew@latest create-snippet --outfile path/to/snippet.js
```

2. Claude Desktopでの適用:
   - Claude Desktopを起動
   - `Cmd + Alt + Shift + i`を押してデベロッパーコンソールを開く
   - 生成されたスニペットの内容をコンソールに貼り付けて実行

### オプション

| オプション             | デフォルト値             | 説明                                              |
| ---------------------- | ------------------------ | ------------------------------------------------- |
| `--disable-send-enter` | `false`                  | `true`の場合、Enterキーでのメッセージ送信を無効化 |
| `--outfile`            | `claude_crew_snippet.js` | 生成されるスニペットの出力先ファイルパス          |

## CLIコマンド

Claude Crewは以下のCLIコマンドを提供します：

- `setup` - インタラクティブなプロジェクトセットアップ
- `setup-db` - データベースを手動でセットアップ（再インストール時に便利）
- `clean` - Dockerコンテナとボリュームを削除してセットアップ前の状態にリセット
- `serve-mcp` - Claude Desktop連携用のMCPサーバーを実行
- `create-snippet` - Claude Desktop用のヘルパースクリプトを生成
  - `--disable-send-enter` - Enterキーでのメッセージ送信を無効化（デフォルト: false）
  - `--outfile` - 出力ファイルパス（デフォルト: claude_crew_snippet.js）

## コントリビューション

コントリビューションは大歓迎です！以下の方法で参加できます：

- バグ報告や機能要望は Issue で
- 改善案は Pull Request で

詳しくは [/docs/contribute/README.md](./docs/contribute/README.md) を確認してください。

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。
