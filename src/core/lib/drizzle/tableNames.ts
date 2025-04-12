export const tableNames = {
  projects: "projects",
  resources: "resources",
  embeddings: "embeddings",
  documents: "documents",
  documentEmbeddings: "document_embeddings",
} as const

export type TableNames = (typeof tableNames)[keyof typeof tableNames]
