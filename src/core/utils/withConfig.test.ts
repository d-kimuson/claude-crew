import { describe, it, expect } from "vitest"
import type { Config } from "../config/schema"
import { withConfig } from "./withConfig"

describe("withConfig", () => {
  describe("Given a callback function", () => {
    describe("When the callback is executed with a config", () => {
      it("Then should return the callback result", () => {
        const mockConfig = { database: { type: "memory" } } as unknown as Config
        const mockCallback = (config: Config) =>
          `Config database type: ${config.database.customDb ? "custom" : "postgres"}`

        const configuredFn = withConfig(mockCallback)
        const result = configuredFn(mockConfig)

        expect(result).toBe("Config database type: postgres")
      })
    })

    describe("When callback accesses specific config properties", () => {
      it("Then should provide those properties to the callback", () => {
        const mockConfig = {
          database: { type: "postgres", url: "postgres://localhost:5432/test" },
          embedding: { provider: "test-provider" },
        } as unknown as Config

        const configuredFn = withConfig((config) => ({
          databaseType: config.database.customDb ? "custom" : "postgres",
          embeddingProvider: config.embedding.provider,
        }))

        const result = configuredFn(mockConfig)

        expect(result).toEqual({
          databaseType: "postgres",
          embeddingProvider: "test-provider",
        })
      })
    })
  })
})
