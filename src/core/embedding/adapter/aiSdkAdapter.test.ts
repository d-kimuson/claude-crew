import * as ai from "ai"
import { describe, it, expect, vi } from "vitest"
import * as generateChunksModule from "../generateChunks"
import { aiSdkEmbeddingAdapter } from "./aiSdkAdapter"

vi.mock("ai", () => ({
  embed: vi.fn(),
  embedMany: vi.fn(),
}))

vi.mock("../generateChunks", () => ({
  generateChunks: vi.fn(),
}))

describe("aiSdkEmbeddingAdapter", () => {
  const mockModel = {
    specificationVersion: "v1" as const,
    provider: "test-provider",
    modelId: "test-model",
    maxEmbeddingsPerCall: 10,
    supportsParallelCalls: true,
    doEmbed: vi.fn(),
  }
  const adapter = aiSdkEmbeddingAdapter(mockModel)

  describe("Given embed method", () => {
    describe("When embedding a single value", () => {
      it("Then should return the embedding array", async () => {
        const mockEmbedding = [0.1, 0.2, 0.3]
        vi.mocked(ai.embed).mockResolvedValueOnce({
          value: "test value",
          embedding: mockEmbedding,
          usage: { tokens: 3 },
        })

        const result = await adapter.embed("test value")

        expect(result).toEqual(mockEmbedding)
        expect(ai.embed).toHaveBeenCalledWith({
          model: mockModel,
          value: "test value",
        })
      })

      it("Then should replace newlines with spaces", async () => {
        const mockEmbedding = [0.1, 0.2, 0.3]
        vi.mocked(ai.embed).mockResolvedValueOnce({
          value: "test value",
          embedding: mockEmbedding,
          usage: { tokens: 3 },
        })

        await adapter.embed("test\\nvalue")

        expect(ai.embed).toHaveBeenCalledWith({
          model: mockModel,
          value: "test value",
        })
      })
    })
  })

  describe("Given generateFileEmbeddings method", () => {
    describe("When generating embeddings for a file", () => {
      it("Then should return embeddings for each chunk", async () => {
        const mockChunks = [
          {
            content: "chunk1",
            filePath: "test.ts",
            startLine: 1,
            endLine: 10,
          },
          {
            content: "chunk2",
            filePath: "test.ts",
            startLine: 11,
            endLine: 20,
          },
        ]
        const mockEmbeddings = [
          [0.1, 0.2],
          [0.3, 0.4],
        ]

        vi.mocked(generateChunksModule.generateChunks).mockReturnValueOnce(
          mockChunks
        )
        vi.mocked(ai.embedMany).mockResolvedValueOnce({
          values: ["chunk1", "chunk2"],
          embeddings: mockEmbeddings,
          usage: { tokens: 6 },
        })

        const result = await adapter.generateFileEmbeddings(
          "test content",
          "test.ts"
        )

        expect(result).toEqual([
          {
            content: "chunk1",
            embedding: [0.1, 0.2],
            filePath: "test.ts",
            startLine: 1,
            endLine: 10,
          },
          {
            content: "chunk2",
            embedding: [0.3, 0.4],
            filePath: "test.ts",
            startLine: 11,
            endLine: 20,
          },
        ])

        expect(generateChunksModule.generateChunks).toHaveBeenCalledWith(
          "test content",
          "test.ts"
        )
        expect(ai.embedMany).toHaveBeenCalledWith({
          model: mockModel,
          values: ["chunk1", "chunk2"],
        })
      })

      it("Then should handle missing chunks gracefully", async () => {
        const mockChunks = [
          { content: "chunk1", filePath: "test.ts", startLine: 1, endLine: 10 },
        ]
        const mockEmbeddings = [
          [0.1, 0.2],
          [0.3, 0.4],
        ] // More embeddings than chunks

        vi.mocked(generateChunksModule.generateChunks).mockReturnValueOnce(
          mockChunks
        )
        vi.mocked(ai.embedMany).mockResolvedValueOnce({
          values: ["chunk1"],
          embeddings: mockEmbeddings,
          usage: { tokens: 3 },
        })

        const result = await adapter.generateFileEmbeddings(
          "test content",
          "test.ts"
        )

        expect(result).toEqual([
          {
            content: "chunk1",
            embedding: [0.1, 0.2],
            filePath: "test.ts",
            startLine: 1,
            endLine: 10,
          },
        ])
      })
    })
  })
})
