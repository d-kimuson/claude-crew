import { openai } from "@ai-sdk/openai"
import { describe, it, expect, vi } from "vitest"
import type { EmbeddingAdapter } from "./interface"
import type { Config } from "../../config/schema"
import type { EmbeddingModel } from "ai"
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

vi.mock("./xenovaAdapter", () => ({
  xenovaEmbeddingAdapter: vi.fn(),
}))

describe("resolveEmbeddingAdapter", () => {
  describe("Given OpenAI provider configuration", () => {
    const mockConfig = {
      embedding: {
        provider: {
          type: "openai" as const,
          model: "text-embedding-ada-002",
          apiKey: "test-api-key",
        },
      },
    } as unknown as Config

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

        const result = resolveEmbeddingAdapter(mockConfig)

        expect(openai.embedding).toHaveBeenCalledWith(
          "text-embedding-ada-002",
          {
            user: "test-api-key",
          }
        )
        expect(aiSdkEmbeddingAdapter).toHaveBeenCalledWith(mockModel)
        expect(result).toBe(mockAdapter)
      })
    })
  })

  describe("Given unsupported provider configuration", () => {
    const mockConfig = {
      embedding: {
        provider: {
          type: "unsupported" as const,
        },
      },
    } as unknown as Config

    describe("When resolving the adapter", () => {
      it("Then should throw an error", () => {
        expect(() => resolveEmbeddingAdapter(mockConfig)).toThrow()
      })
    })
  })
})
