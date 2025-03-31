import { readFileSync } from "node:fs"
import { describe, it, expect, vi } from "vitest"
import { configFactory } from "../../../test/helpers/context"
import { loadConfig } from "./loadConfig"

vi.mock("node:fs")

describe("loadConfig", () => {
  describe("Given a valid config file", () => {
    describe("When loading the config", () => {
      it("Then should return parsed config", () => {
        const mockConfig = configFactory()

        vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig))

        const config = loadConfig("config.json")
        expect(config).toEqual(mockConfig)
        expect(readFileSync).toHaveBeenCalledWith("config.json", "utf-8")
      })
    })

    describe("When loading an invalid config", () => {
      it("Then should throw an error", () => {
        const invalidConfig = {
          name: "test-project",
          // Missing required fields
        }

        vi.mocked(readFileSync).mockReturnValue(JSON.stringify(invalidConfig))

        expect(() => loadConfig("config.json")).toThrow()
      })
    })

    describe("When file cannot be read", () => {
      it("Then should throw an error", () => {
        vi.mocked(readFileSync).mockImplementation(() => {
          throw new Error("File not found")
        })

        expect(() => loadConfig("config.json")).toThrow("File not found")
      })
    })

    describe("When file contains invalid JSON", () => {
      it("Then should throw an error", () => {
        vi.mocked(readFileSync).mockReturnValue("invalid json")

        expect(() => loadConfig("config.json")).toThrow(SyntaxError)
      })
    })
  })
})
