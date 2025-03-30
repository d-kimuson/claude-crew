import { createOpenAI } from "@ai-sdk/openai"
import { withContext } from "../../context/withContext"
import { aiSdkEmbeddingAdapter } from "./aiSdkAdapter"

export const resolveEmbeddingAdapter = withContext((ctx) => {
  switch (ctx.config.embedding.provider.type) {
    case "openai": {
      const model = createOpenAI({
        compatibility: "strict",
        apiKey: ctx.config.embedding.provider.apiKey,
      }).embedding(ctx.config.embedding.provider.model, {
        user: ctx.config.embedding.provider.apiKey,
      })
      return aiSdkEmbeddingAdapter(model)
    }
    default:
      throw new Error(
        `Unsupported embedding provider: ${String(ctx.config.embedding.provider.type)}`
      )
  }
})
