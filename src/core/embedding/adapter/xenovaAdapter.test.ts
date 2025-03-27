import * as transformers from "@xenova/transformers"
import { describe, it, expect, vi } from "vitest"
import * as generateChunksModule from "../generateChunks"
import { xenovaEmbeddingAdapter } from "./xenovaAdapter"

vi.mock("@xenova/transformers", () => ({
  pipeline: vi.fn(),
}))

vi.mock("../generateChunks", () => ({
  generateChunks: vi.fn(),
}))

describe("xenovaEmbeddingAdapter", () => {
  const mockOutput = {
    data: new Float32Array([0.1, 0.2, 0.3]),
  }
  const mockExtractor = vi.fn().mockResolvedValue(mockOutput)

  beforeEach(() => {
    // @ts-expect-error -- ignore
    vi.mocked(transformers.pipeline).mockResolvedValue(mockExtractor)
  })

  describe("Given embed method", () => {
    describe("When embedding a single value", () => {
      it("Then should return the embedding array", async () => {
        const adapter = await xenovaEmbeddingAdapter()
        const result = await adapter.embed("test value")

        expect(result).toHaveLength(3)
        expect(result[0]).toBeCloseTo(0.1)
        expect(result[1]).toBeCloseTo(0.2)
        expect(result[2]).toBeCloseTo(0.3)
        expect(mockExtractor).toHaveBeenCalledWith("test value", {
          pooling: "mean",
          normalize: true,
        })
      })

      it("Then should replace newlines with spaces", async () => {
        const adapter = await xenovaEmbeddingAdapter()
        await adapter.embed("test\\nvalue")

        expect(mockExtractor).toHaveBeenCalledWith("test value", {
          pooling: "mean",
          normalize: true,
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

        vi.mocked(generateChunksModule.generateChunks).mockReturnValue(
          mockChunks
        )
        const adapter = await xenovaEmbeddingAdapter()
        const result = await adapter.generateFileEmbeddings(
          "test content",
          "test.ts"
        )

        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({
          content: "chunk1",
          embedding: expect.arrayContaining<number>([
            expect.closeTo(0.1, 0.1001) as number,
            expect.closeTo(0.2, 0.2001) as number,
            expect.closeTo(0.3, 0.3001) as number,
          ]) as number[],
          filePath: "test.ts",
          startLine: 1,
          endLine: 10,
        })
        expect(result[1]).toEqual({
          content: "chunk2",
          embedding: expect.arrayContaining([
            expect.closeTo(0.1, 2) as number,
            expect.closeTo(0.2, 2) as number,
            expect.closeTo(0.3, 2) as number,
          ]) as number[],
          filePath: "test.ts",
          startLine: 11,
          endLine: 20,
        })

        expect(generateChunksModule.generateChunks).toHaveBeenCalledWith(
          "test content",
          "test.ts"
        )
        expect(mockExtractor).toHaveBeenCalledWith("chunk1", {
          pooling: "mean",
          normalize: true,
        })
        expect(mockExtractor).toHaveBeenCalledWith("chunk2", {
          pooling: "mean",
          normalize: true,
        })
      })

      it("Then should handle empty chunks", async () => {
        vi.mocked(generateChunksModule.generateChunks).mockReturnValue([])
        const adapter = await xenovaEmbeddingAdapter()
        const result = await adapter.generateFileEmbeddings(
          "test content",
          "test.ts"
        )

        expect(result).toEqual([])
        expect(mockExtractor).not.toHaveBeenCalled()
      })

      it("Then should replace newlines with spaces in chunks", async () => {
        const mockChunks = [
          {
            content: "chunk1\\ntest",
            filePath: "test.ts",
            startLine: 1,
            endLine: 10,
          },
        ]

        vi.mocked(generateChunksModule.generateChunks).mockReturnValue(
          mockChunks
        )
        const adapter = await xenovaEmbeddingAdapter()
        await adapter.generateFileEmbeddings("test content", "test.ts")

        expect(mockExtractor).toHaveBeenCalledWith("chunk1 test", {
          pooling: "mean",
          normalize: true,
        })
      })
    })
  })
})
