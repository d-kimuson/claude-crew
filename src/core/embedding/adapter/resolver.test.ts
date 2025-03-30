import { openai } from "@ai-sdk/openai"
import { describe, it, expect, vi } from "vitest"
import type { EmbeddingAdapter } from "./interface"
import type { Config } from "../../config/schema"
import type { EmbeddingModel } from "ai"
import { contextFactory } from "../../../../test/helpers/context"
import { aiSdkEmbeddingAdapter } from "./aiSdkAdapter"
import { resolveEmbeddingAdapter } from "./resolver"

vi.mock("@ai-sdk/openai", () => ({
  openai: {
    embedding: vi.fn(),
  },
}))

vi.mock("./aiSdkAdapter", () => ({
  aiSdkEmbeddingAdapter: vi.fn(),
}))

describe("resolveEmbeddingAdapter", () => {
  describe("Given OpenAI provider configuration", () => {
    const mockContext = contextFactory()

    describe("When resolving the adapter", () => {
      it("Then should return an AI SDK adapter with OpenAI model", () => {
        const mockModel = {
          id: "openai-model",
        } as unknown as EmbeddingModel<string>
        const mockAdapter = {
          id: "ai-sdk-adapter",
        } as unknown as EmbeddingAdapter

        vi.mocked(openai.embedding).mockReturnValue(mockModel)
        vi.mocked(aiSdkEmbeddingAdapter).mockReturnValue(mockAdapter)

        const result = resolveEmbeddingAdapter(mockContext)

        expect(openai.embedding).toHaveBeenCalledWith(
          "text-embedding-ada-002",
          {
            user: "dummy-openai-api-key",
          }
        )
        expect(aiSdkEmbeddingAdapter).toHaveBeenCalledWith(mockModel)
        expect(result).toBe(mockAdapter)
      })
    })
  })

  describe("Given unsupported provider configuration", () => {
    const mockContext = contextFactory((ctx) => ({
      ...ctx,
      config: {
        ...ctx.config,
        embedding: {
          provider: {
            type: "invalid" as const,
          },
        },
      } as unknown as Config,
    }))

    describe("When resolving the adapter", () => {
      it("Then should throw an error", () => {
        expect(() => resolveEmbeddingAdapter(mockContext)).toThrow()
      })
    })
  })
})
