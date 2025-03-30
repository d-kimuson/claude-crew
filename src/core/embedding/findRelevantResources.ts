import { cosineDistance, sql, gt, desc } from "drizzle-orm"
import { withContext } from "../context/withContext"
import { embeddingsTable } from "../lib/drizzle/schema/embeddings"
import { resolveEmbeddingAdapter } from "./adapter/resolver"

export const findRelevantResources = withContext(
  (ctx) =>
    async (
      userQuery: string,
      options: {
        limit?: number
        threshold?: number
      } = {}
    ) => {
      const { limit = 4, threshold = 0.5 } = options

      const adapter = resolveEmbeddingAdapter(ctx)
      const userQueryEmbedded = await adapter.embed(userQuery)
      const similarity = sql<number>`1 - (${cosineDistance(
        embeddingsTable.embedding,
        userQueryEmbedded
      )})`
      const similarContents = await ctx.db
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
