import { cosineDistance, sql, gt, desc } from "drizzle-orm"
import { withContext } from "../context/withContext"
import { documentEmbeddingsTable } from "../lib/drizzle/schema/documentEmbeddings"
import { resolveEmbeddingAdapter } from "./adapter/resolver"

export const findRelevantDocuments = withContext(
  (ctx) =>
    async (
      userQuery: string,
      options: {
        limit?: number
        threshold?: number
      } = {}
    ) => {
      const { limit = 4, threshold = 0.5 } = options

      const adapter = await resolveEmbeddingAdapter(ctx)
      const userQueryEmbedded = await adapter.embed(userQuery)
      const similarity = sql<number>`1 - (${cosineDistance(
        documentEmbeddingsTable.embedding,
        userQueryEmbedded
      )})`
      const similarContents = await ctx.db
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
