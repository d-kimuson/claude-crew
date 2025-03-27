import { pipeline } from "@xenova/transformers"
import type {
  Embedding,
  EmbeddingAdapter,
  EmbeddingManyResult,
} from "./interface"
import { generateChunks } from "../generateChunks"

export const xenovaEmbeddingAdapter = async (): Promise<EmbeddingAdapter> => {
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/bert-base-uncased"
  )

  return {
    embed: async (value: string) => {
      const input = value.replaceAll("\\n", " ")
      // Xenovaを使用して埋め込みを生成
      const output = await extractor(input, {
        pooling: "mean",
        normalize: true,
      })
      // 埋め込みベクトルを配列として返す
      const embedding: Embedding = Array.from(output.data).map(Number)
      return embedding
    },
    generateFileEmbeddings: async (value: string, filePath: string) => {
      const chunks = generateChunks(value, filePath)

      // 処理する前にチャンクが空でないか確認
      if (chunks.length === 0) {
        return []
      }

      // 各チャンクの埋め込みを順番に生成
      const results: EmbeddingManyResult[] = []

      for (const chunk of chunks) {
        const cleanContent = chunk.content.replaceAll("\\n", " ")
        const output = await extractor(cleanContent, {
          pooling: "mean",
          normalize: true,
        })
        const embedding: Embedding = Array.from(output.data).map(Number)

        results.push({
          content: chunk.content,
          embedding,
          filePath: chunk.filePath,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
        })
      }

      return results
    },
  }
}
