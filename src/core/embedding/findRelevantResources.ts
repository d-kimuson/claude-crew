import { cosineDistance, sql, gt, desc } from "drizzle-orm"
import { embeddingsTable } from "../lib/drizzle/schema/embeddings"
import { withDb } from "../lib/drizzle/withDb"
import { generateEmbedding } from "./generateEmbeddings"

export const findRelevantResources = withDb(
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
        embeddingsTable.embedding,
        userQueryEmbedded
      )})`
      const similarContents = await db
        .select({
          id: embeddingsTable.id,
          resourceId: embeddingsTable.resourceId,
          content: embeddingsTable.content,
          embedding: embeddingsTable.embedding,
          metadata: embeddingsTable.metadata,
          similarity,
        })
        .from(embeddingsTable)
        .where(gt(similarity, threshold))
        .orderBy((t) => desc(t.similarity))
        .limit(limit)
      return similarContents
    }
)
