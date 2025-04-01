import { createOpenAI } from "@ai-sdk/openai"
import { isIntegrationEnabled } from "../../../mcp-server/integrations/isIntegrationEnabled"
import { withContext } from "../../context/withContext"
import { aiSdkEmbeddingAdapter } from "./aiSdkAdapter"

export const resolveEmbeddingAdapter = withContext((ctx) => {
  // If embedding is disabled, return a dummy adapter
  if (!isIntegrationEnabled(ctx)("rag")) {
    throw new Error("Embedding is disabled")
  }

  const provider = ctx.config.integrations.find(
    (integration) => integration.name === "rag"
  )?.config.provider

  // Otherwise, return the appropriate adapter based on the provider type
  switch (provider?.type) {
    case "openai": {
      const model = createOpenAI({
        compatibility: "strict",
        apiKey: provider.apiKey,
      }).embedding(provider.model, {
        user: provider.apiKey,
      })
      return aiSdkEmbeddingAdapter(model)
    }
    default:
      throw new Error(
        `Unsupported embedding provider: ${String(provider?.type)}`
      )
  }
})
