import { describe, it, expect } from "vitest"
import { DiscriminatedError } from "./DiscriminatedError"
import { unhandledError } from "./unhandleError"

describe("unhandledError", () => {
  describe("Given an error cause", () => {
    describe("When creating an unhandled error", () => {
      it("Then should return a DiscriminatedError with correct code", () => {
        const cause = new Error("Test error")

        const error = unhandledError(cause)

        expect(error).toBeInstanceOf(DiscriminatedError)
        expect(error.code).toBe("UNHANDLED_ERROR")
        expect(error.message).toBe("Unhandled error")
        expect(error.cause).toBe(cause)
      })
    })

    describe("When creating an unhandled error with method data", () => {
      it("Then should include method in error data", () => {
        const cause = new Error("Test error")
        const data = { method: "testMethod" }

        const error = unhandledError(cause, data)

        expect(error.details).toEqual(data)
      })
    })

    describe("When creating an unhandled error with non-Error cause", () => {
      it("Then should handle string cause", () => {
        const cause = "String error"

        const error = unhandledError(cause)

        expect(error.cause).toBe(cause)
      })

      it("Then should handle object cause", () => {
        const cause = { error: "Object error" }

        const error = unhandledError(cause)

        expect(error.cause).toBe(cause)
      })
    })
  })
})
