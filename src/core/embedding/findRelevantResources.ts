import { withContext } from "../context/withContext"
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
      const similarContents =
        await ctx.queries.embeddings.searchRelevant.execute({
          queryEmbedding: userQueryEmbedded,
          threshold,
          limit,
        })

      return similarContents
    }
)
