import { createOpenAI } from "@ai-sdk/openai"
import { withConfig } from "../../utils/withConfig"
import { aiSdkEmbeddingAdapter } from "./aiSdkAdapter"

export const resolveEmbeddingAdapter = withConfig((config) => {
  switch (config.embedding.provider.type) {
    case "openai": {
      const model = createOpenAI({
        compatibility: "strict",
        apiKey: config.embedding.provider.apiKey,
      }).embedding(config.embedding.provider.model, {
        user: config.embedding.provider.apiKey,
      })
      return aiSdkEmbeddingAdapter(model)
    }
    default:
      throw new Error(
        `Unsupported embedding provider: ${String(config.embedding.provider.type)}`
      )
  }
})
