import path from "node:path"
import Parser from "tree-sitter"
import JavaScript from "tree-sitter-javascript"
import Python from "tree-sitter-python"
import TypeScript from "tree-sitter-typescript"
import { logger } from "../../lib/logger"

// Map that associates language parsers and chunk types based on file extensions
const LANGUAGE_CONFIG: Record<
  string,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parser: any
    chunkTypes: string[]
  }
> = {
  // JavaScript variants
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
  // TypeScript variants
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

// Words per chunk for line-based fallback chunking
const WORDS_PER_CHUNK = 100

type Chunk = {
  filePath: string
  startLine: number
  endLine: number
  content: string
}

/**
 * Generates syntax-based code chunks for supported languages,
 * and falls back to line-based chunking for unsupported languages
 */
export const generateChunks = (input: string, filePath: string): Chunk[] => {
  if (!input.trim()) return []

  const ext = path.extname(filePath).slice(1).toLowerCase()
  const config = LANGUAGE_CONFIG[ext]

  // Use syntax-based chunking for supported languages
  if (config) {
    try {
      const parser = new Parser()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      parser.setLanguage(config.parser)

      const tree = parser.parse(input)

      // Process nodes recursively to find chunks
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

        // Process child nodes
        const children = Array.from({
          length: node.childCount,
        })
          .map((_, i) => node.child(i))
          .filter((child) => child !== null)

        const childrenChunks = children.flatMap((node) => processNode(node))
        if (childrenChunks.length !== 0) {
          return childrenChunks
        } else if (nodeChunk !== null) {
          // If we can't split into smaller chunks, use the entire node as a chunk
          return [nodeChunk]
        }

        return []
      }

      const chunks = processNode(tree.rootNode)

      // If chunks were found, return them
      if (chunks.length > 0) {
        return chunks
      }
    } catch (error) {
      logger.error(`Failed to parse ${ext} file:`, error)
      // Proceed to fallback chunking
    }
  }

  // Breakpoint-based chunking
  const result = breakPointBasedChunking(input, filePath)
  if (result.success) {
    return result.chunks
  }

  // Fallback: Line-based chunking with word count limit
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
 * Fallback chunking method: splits by line and groups by word count
 */
const lineBasedChunking = (
  input: string,
  filePath: string,
  wordsPerChunk: number
): Chunk[] => {
  // Split by lines and keep non-empty lines
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

    // If adding this line exceeds the target word count and there's already content,
    // complete the current chunk and start a new one
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

    // Add the line to the current chunk
    currentChunk.push({
      filePath,
      line,
      content,
    })
    wordCount += lineWordCount
  }

  // Add the last chunk if there's content
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
