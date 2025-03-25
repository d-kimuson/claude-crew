import { cosineDistance, sql, gt, desc } from "drizzle-orm"
import { documentEmbeddingsTable } from "../lib/drizzle/schema/documentEmbeddings"
import { withDb } from "../lib/drizzle/withDb"
import { generateEmbedding } from "./generateEmbeddings"

export const findRelevantDocuments = withDb(
  ({ db }) =>
    async (
      userQuery: string,
      options: {
        limit?: number
        threshold?: number
      } = {}
    ) => {
      const { limit = 4, threshold = 0.5 } = options
      const userQueryEmbedded = await generateEmbedding(userQuery)
      const similarity = sql<number>`1 - (${cosineDistance(
        documentEmbeddingsTable.embedding,
        userQueryEmbedded
      )})`
      const similarContents = await db
        .select({
          id: documentEmbeddingsTable.id,
          documentId: documentEmbeddingsTable.documentId,
          content: documentEmbeddingsTable.content,
          embedding: documentEmbeddingsTable.embedding,
          metadata: documentEmbeddingsTable.metadata,
          similarity,
        })
        .from(documentEmbeddingsTable)
        .where(gt(similarity, threshold))
        .orderBy((t) => desc(t.similarity))
        .limit(limit)
      return similarContents
    }
)
