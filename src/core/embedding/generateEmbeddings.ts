import { openai } from "@ai-sdk/openai"
import { embed, embedMany } from "ai"
import { generateChunks } from "./generateChunks"

const embeddingModel = openai.embedding("text-embedding-ada-002")

const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ")
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  })
  return embedding
}

const generateEmbeddings = async (
  value: string,
  filePath: string
): Promise<
  {
    embedding: number[]
    content: string
    filePath: string
    startLine: number
    endLine: number
  }[]
> => {
  const chunks = generateChunks(value, filePath)
  const { embeddings } = await embedMany({
    model: embeddingModel,
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
}
