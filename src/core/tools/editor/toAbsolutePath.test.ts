import { resolve } from "node:path"
import { describe, it, expect } from "vitest"
import { contextFactory } from "../../../../test/helpers/context"
import { toAbsolutePath } from "./toAbsolutePath"

describe("toAbsolutePath", () => {
  const mockContext = contextFactory()

  const toAbsolutePathWithConfig = toAbsolutePath(mockContext)

  describe("Given a file path", () => {
    describe("When the path is absolute", () => {
      it("Then should return the path unchanged", () => {
        const absolutePath = "/absolute/path/to/file.ts"
        expect(toAbsolutePathWithConfig(absolutePath)).toBe(absolutePath)
      })
    })

    describe("When the path is relative", () => {
      it("Then should resolve the path relative to the config directory", () => {
        const relativePath = "relative/path/to/file.ts"
        const expectedPath = resolve(mockContext.config.directory, relativePath)
        expect(toAbsolutePathWithConfig(relativePath)).toBe(expectedPath)
      })
    })
  })
})
