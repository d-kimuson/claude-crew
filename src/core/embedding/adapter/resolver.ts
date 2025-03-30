import { openai } from "@ai-sdk/openai"
import { withContext } from "../../context/withContext"
import { aiSdkEmbeddingAdapter } from "./aiSdkAdapter"
import { xenovaEmbeddingAdapter } from "./xenovaAdapter"

export const resolveEmbeddingAdapter = withContext((ctx) => {
  switch (ctx.config.embedding.provider.type) {
    case "openai": {
      const model = openai.embedding(ctx.config.embedding.provider.model, {
        user: ctx.config.embedding.provider.apiKey,
      })
      return aiSdkEmbeddingAdapter(model)
    }
    case "xenova":
      return xenovaEmbeddingAdapter()
    default:
      ctx.config.embedding.provider satisfies never
      throw new Error(
        `Unsupported embedding provider: ${String(ctx.config.embedding.provider)}`
      )
  }
})
