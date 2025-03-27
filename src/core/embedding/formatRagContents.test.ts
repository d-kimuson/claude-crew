import { describe, expect, it } from "vitest"
import { formatRagContents } from "./formatRagContents"

describe("Given the formatRagContents function", () => {
  describe("When formatting valid RAG contents", () => {
    it("Then returns formatted string with file labels", () => {
      const contents = [
        {
          content: "function test() { return true }",
          embedding: [0.1, 0.2, 0.3],
          metadata: {
            filePath: "test.ts",
            startLine: 1,
            endLine: 3,
          },
        },
        {
          content: "class Example { constructor() {} }",
          embedding: [0.4, 0.5, 0.6],
          metadata: {
            filePath: "example.ts",
            startLine: 5,
            endLine: 7,
          },
        },
      ]

      const result = formatRagContents(contents)

      expect(result).toBe(
        "<test.ts#1~3>\nfunction test() { return true }\n</test.ts#1~3>\n" +
          "<example.ts#5~7>\nclass Example { constructor() {} }\n</example.ts#5~7>"
      )
    })
  })

  describe("When formatting contents with invalid metadata", () => {
    it("Then filters out invalid entries", () => {
      const contents = [
        {
          content: "valid content",
          embedding: [0.1, 0.2],
          metadata: {
            filePath: "test.ts",
            startLine: 1,
            endLine: 2,
          },
        },
        {
          content: "invalid content",
          embedding: [0.3, 0.4],
          metadata: {
            // Missing required fields
            filePath: "test.ts",
          },
        },
      ]

      const result = formatRagContents(contents)

      expect(result).toBe("<test.ts#1~2>\nvalid content\n</test.ts#1~2>")
    })
  })

  describe("When formatting empty contents array", () => {
    it("Then returns empty string", () => {
      const result = formatRagContents([])
      expect(result).toBe("")
    })
  })
})
