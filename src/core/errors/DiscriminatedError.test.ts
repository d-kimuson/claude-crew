import { describe, it, expect } from "vitest"
import { DiscriminatedError } from "./DiscriminatedError"

describe("DiscriminatedError", () => {
  describe("Given error code, message, and data", () => {
    describe("When creating a new error", () => {
      it("Then should set properties correctly", () => {
        const code = "TEST_ERROR"
        const message = "Test error message"
        const data = { field: "value" }

        const error = new DiscriminatedError(code, message, data)

        expect(error.code).toBe(code)
        expect(error.message).toBe(message)
        expect(error.details).toEqual(data)
      })
    })

    describe("When creating an error with a cause", () => {
      it("Then should set the cause property", () => {
        const cause = new Error("Original error")
        const code = "TEST_ERROR"
        const message = "Test error message"
        const data = { field: "value" }

        const error = new DiscriminatedError(code, message, data, cause)

        expect(error.cause).toBe(cause)
      })

      it("Then should use the cause's stack if it exists", () => {
        const cause = new Error("Original error")
        const code = "TEST_ERROR"
        const message = "Test error message"
        const data = { field: "value" }

        const error = new DiscriminatedError(code, message, data, cause)

        expect(error.stack).toBe(cause.stack)
      })
    })
  })
})
