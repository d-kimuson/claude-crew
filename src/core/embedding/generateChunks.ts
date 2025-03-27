import path from "node:path"
import Parser from "tree-sitter"
import JavaScript from "tree-sitter-javascript"
import Python from "tree-sitter-python"
import TypeScript from "tree-sitter-typescript"

// 拡張子から言語パーサーとチャンクタイプを対応付けるマップ
const LANGUAGE_CONFIG: Record<
  string,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parser: any
    chunkTypes: string[]
  }
> = {
  // JavaScript バリアント
  js: {
    parser: JavaScript,
    chunkTypes: [
      "function_declaration",
      "class_declaration",
      "method_definition",
      "arrow_function",
      "export_statement",
      "import_statement",
      "variable_declaration",
    ],
  },
  mjs: {
    parser: JavaScript,
    chunkTypes: [
      "function_declaration",
      "class_declaration",
      "method_definition",
      "arrow_function",
      "export_statement",
      "import_statement",
      "variable_declaration",
    ],
  },
  cjs: {
    parser: JavaScript,
    chunkTypes: [
      "function_declaration",
      "class_declaration",
      "method_definition",
      "arrow_function",
      "export_statement",
      "import_statement",
      "variable_declaration",
    ],
  },
  jsx: {
    parser: JavaScript,
    chunkTypes: [
      "function_declaration",
      "class_declaration",
      "method_definition",
      "arrow_function",
      "export_statement",
      "import_statement",
      "variable_declaration",
      "jsx_element",
    ],
  },
  // TypeScript バリアント
  ts: {
    parser: TypeScript.typescript,
    chunkTypes: [
      "function_declaration",
      "class_declaration",
      "method_definition",
      "arrow_function",
      "export_statement",
      "interface_declaration",
      "type_alias_declaration",
    ],
  },
  mts: {
    parser: TypeScript.typescript,
    chunkTypes: [
      "function_declaration",
      "class_declaration",
      "method_definition",
      "arrow_function",
      "export_statement",
      "interface_declaration",
      "type_alias_declaration",
    ],
  },
  cts: {
    parser: TypeScript.typescript,
    chunkTypes: [
      "function_declaration",
      "class_declaration",
      "method_definition",
      "arrow_function",
      "export_statement",
      "interface_declaration",
      "type_alias_declaration",
    ],
  },
  tsx: {
    parser: TypeScript.tsx,
    chunkTypes: [
      "function_declaration",
      "class_declaration",
      "method_definition",
      "arrow_function",
      "export_statement",
      "interface_declaration",
      "type_alias_declaration",
      "jsx_element",
    ],
  },
  mtx: {
    parser: TypeScript.tsx,
    chunkTypes: [
      "function_declaration",
      "class_declaration",
      "method_definition",
      "arrow_function",
      "export_statement",
      "interface_declaration",
      "type_alias_declaration",
    ],
  },
  ctx: {
    parser: TypeScript.tsx,
    chunkTypes: [
      "function_declaration",
      "class_declaration",
      "method_definition",
      "arrow_function",
      "export_statement",
      "interface_declaration",
      "type_alias_declaration",
    ],
  },
  // Python
  py: {
    parser: Python,
    chunkTypes: ["function_definition", "class_definition", "import_statement"],
  },
}

// 行ベースのフォールバックにおける単語数/チャンク
const WORDS_PER_CHUNK = 100

type Chunk = {
  filePath: string
  startLine: number
  endLine: number
  content: string
}

/**
 * サポートされている言語に対して構文ベースのコードチャンクを生成し、
 * サポートされていない言語に対しては行ベースのチャンキングにフォールバックします
 */
export const generateChunks = (input: string, filePath: string): Chunk[] => {
  if (!input.trim()) return []

  const ext = path.extname(filePath).slice(1).toLowerCase()
  const config = LANGUAGE_CONFIG[ext]

  // サポートされている言語であれば、構文ベースのチャンキングを使用
  if (config) {
    try {
      const parser = new Parser()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      parser.setLanguage(config.parser)

      const tree = parser.parse(input)

      // ノードを再帰的に処理してチャンクを見つける
      const processNode = (node: Parser.SyntaxNode): Chunk[] => {
        const nodeChunk = config.chunkTypes.includes(node.type)
          ? {
              filePath,
              startLine: node.startPosition.row,
              endLine: node.endPosition.row,
              content: input.substring(node.startIndex, node.endIndex),
            }
          : null

        if (
          nodeChunk !== null &&
          nodeChunk.endLine - nodeChunk.startLine < 30
        ) {
          return [nodeChunk]
        }

        // 子ノードを処理
        const children = Array.from({
          length: node.childCount,
        })
          .map((_, i) => node.child(i))
          .filter((child) => child !== null)

        const childrenChunks = children.flatMap((node) => processNode(node))
        if (childrenChunks.length !== 0) {
          return childrenChunks
        } else if (nodeChunk !== null) {
          // 小さいチャンクにしたいが、分割できない場合はまとまりを Chunk にする
          return [nodeChunk]
        }

        return []
      }

      const chunks = processNode(tree.rootNode)

      // チャンクが見つかった場合はそれを返す
      if (chunks.length > 0) {
        return chunks
      }
    } catch (error) {
      console.error(`${ext}ファイルの構文解析に失敗しました:`, error)
      // フォールバックチャンキングへ進む
    }
  }

  // ブレークポイントベースのチャンキング
  const result = breakPointBasedChunking(input, filePath)
  if (result.success) {
    return result.chunks
  }

  // フォールバック: 行ベースのチャンキングと単語数による制限
  return lineBasedChunking(input, filePath, WORDS_PER_CHUNK)
}

const breakPoints = ["--> statement-breakpoint"]

const breakPointBasedChunking = (
  input: string,
  filePath: string
): { success: false } | { success: true; chunks: Chunk[] } => {
  const breakPoint = breakPoints.find((breakPoint) =>
    input.includes(breakPoint)
  )
  if (breakPoint === undefined) {
    return {
      success: false,
    }
  }

  return {
    success: true,
    chunks: input.split(breakPoint).map((content) => ({
      filePath,
      startLine: 0,
      endLine: 0,
      content,
    })),
  }
}

/**
 * フォールバック用のチャンキングメソッド：行で分割し単語数でグループ化
 */
const lineBasedChunking = (
  input: string,
  filePath: string,
  wordsPerChunk: number
): Chunk[] => {
  // 行で分割し、空でない行を保持
  const lines = input
    .split("\n")
    .map((content, index) => ({
      content,
      line: index,
    }))
    .filter((line) => line.content.trim().length > 0)
  const chunks: Chunk[] = []
  let currentChunk: {
    filePath: string
    line: number
    content: string
  }[] = []
  let wordCount = 0

  for (const { content, line } of lines) {
    const lineWordCount = content.trim().split(/\s+/).length

    // この行を追加すると目標単語数を超え、すでにコンテンツがある場合は、
    // 現在のチャンクを完成させて新しいチャンクを開始
    if (wordCount + lineWordCount > wordsPerChunk && currentChunk.length > 0) {
      const firstChunk = currentChunk[0]
      if (firstChunk !== undefined) {
        chunks.push({
          filePath,
          startLine: firstChunk.line,
          endLine: line,
          content: currentChunk.map(({ content }) => content).join("\n"),
        })
      }
      currentChunk = []
      wordCount = 0
    }

    // 行を現在のチャンクに追加
    currentChunk.push({
      filePath,
      line,
      content,
    })
    wordCount += lineWordCount
  }

  // コンテンツがある場合は最後のチャンクを追加
  if (currentChunk.length > 0) {
    const firstChunk = currentChunk.at(0)
    const lastChunk = currentChunk.at(-1)
    if (firstChunk !== undefined && lastChunk !== undefined) {
      chunks.push({
        filePath,
        startLine: firstChunk.line,
        endLine: lastChunk.line,
        content: currentChunk.map(({ content }) => content).join("\n"),
      })
    }
  }

  return chunks
}
