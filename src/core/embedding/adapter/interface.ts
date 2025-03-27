export type Embedding = number[]

export type EmbeddingManyResult = {
  content: string
  embedding: Embedding
  filePath: string
  startLine: number
  endLine: number
}

export type EmbeddingAdapter = {
  embed: (value: string) => Promise<Embedding>
  generateFileEmbeddings: (
    value: string,
    filePath: string
  ) => Promise<EmbeddingManyResult[]>
}
