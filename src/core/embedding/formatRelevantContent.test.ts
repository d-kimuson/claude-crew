import { describe, expect, it } from "vitest"
import {
  formatRelevantContent,
  type RelevantContentResult,
} from "./formatRelevantContent"

describe("Given the formatRelevantContent function", () => {
  describe("When formatting valid relevant content results", () => {
    it("Then returns formatted string with file labels and line numbers", () => {
      const contents: RelevantContentResult[] = [
        {
          id: "1",
          resourceId: "resource1",
          content: "function test() { return true }",
          embedding: [0.1, 0.2, 0.3],
          metadata: {
            filePath: "test.ts",
            startLine: 1,
            endLine: 3,
          },
          similarity: 0.95,
        },
        {
          id: "2",
          resourceId: "resource2",
          content: "class Example { constructor() {} }",
          embedding: [0.4, 0.5, 0.6],
          metadata: {
            filePath: "example.ts",
            startLine: 5,
            endLine: 7,
          },
          similarity: 0.85,
        },
      ]

      const result = formatRelevantContent(contents)

      expect(result).toBe(
        "<test.ts#L1~L3>\nfunction test() { return true }\n</test.ts#L1~L3>\n\n" +
          "<example.ts#L5~L7>\nclass Example { constructor() {} }\n</example.ts#L5~L7>"
      )
    })
  })

  describe("When formatting empty content array", () => {
    it("Then returns empty string", () => {
      const result = formatRelevantContent([])
      expect(result).toBe("")
    })
  })

  describe("When formatting content with invalid metadata", () => {
    it("Then throws an error", () => {
      const contents: RelevantContentResult[] = [
        {
          id: "1",
          resourceId: "resource1",
          content: "test content",
          embedding: [0.1, 0.2],
          metadata: {
            // Missing required fields
            filePath: "test.ts",
          },
          similarity: 0.9,
        },
      ]

      expect(() => formatRelevantContent(contents)).toThrow()
    })
  })
})
