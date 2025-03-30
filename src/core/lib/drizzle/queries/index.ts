import type { DB } from ".."
import { documentEmbeddingsQueries } from "./documentEmbeddings"
import { documentQueries } from "./documents"
import { embeddingQueries } from "./embeddings"
import { projectQueries } from "./projects"
import { resourceQueries } from "./resources"

export const queries = (db: DB) =>
  ({
    projects: projectQueries(db),
    resources: resourceQueries(db),
    embeddings: embeddingQueries(db),
    documents: documentQueries(db),
    documentEmbeddings: documentEmbeddingsQueries(db),
  }) as const

export type Queries = ReturnType<typeof queries>
