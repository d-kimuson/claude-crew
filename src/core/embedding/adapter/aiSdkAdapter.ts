import { embed, embedMany, type EmbeddingModel } from "ai"
import type { EmbeddingAdapter } from "./interface"
import { generateChunks } from "../generateChunks"

export const aiSdkEmbeddingAdapter = (
  model: EmbeddingModel<string>
): EmbeddingAdapter => {
  return {
    embed: async (value: string) => {
      const input = value.replaceAll("\\n", " ")
      const { embedding } = await embed({
        model: model,
        value: input,
      })
      return embedding
    },
    generateFileEmbeddings: async (value: string, filePath: string) => {
      const chunks = generateChunks(value, filePath)
      const { embeddings } = await embedMany({
        model: model,
        values: chunks.map(({ content }) => content),
      })

      return embeddings.flatMap((e, i) => {
        const chunk = chunks[i]
        if (chunk === undefined) return []

        return [
          {
            content: chunk.content,
            embedding: e,
            filePath: chunk.filePath,
            startLine: chunk.startLine,
            endLine: chunk.endLine,
          },
        ]
      })
    },
  }
}
