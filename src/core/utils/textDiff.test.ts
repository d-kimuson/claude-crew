import { describe, it, expect } from "vitest"
import { textDiff } from "./textDiff"

describe("textDiff", () => {
  describe("Given two identical strings", () => {
    describe("When calculating difference", () => {
      it("Then should return empty string", () => {
        const oldText = "Hello world"
        const newText = "Hello world"

        const result = textDiff(oldText, newText)

        expect(result).toBe("")
      })
    })
  })

  describe("Given strings with differences", () => {
    describe("When calculating difference", () => {
      it("Then should return the difference", () => {
        const oldText = "Hello world"
        const newText = "Hello Claude"

        const result = textDiff(oldText, newText)

        expect(result).toBe("-Hello world\n+Hello Claude")
      })
    })
  })

  describe("Given multiline strings", () => {
    describe("When calculating difference", () => {
      it("Then should return the difference with line breaks", () => {
        const oldText = "Line 1\nLine 2\nLine 3"
        const newText = "Line 1\nLine changed\nLine 3"

        const result = textDiff(oldText, newText)

        expect(result).toBe(" Line 1\n-Line 2\n+Line changed\n Line 3")
      })
    })
  })
})
