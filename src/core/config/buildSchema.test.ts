import { writeFile } from "fs/promises"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"
import { buildJsonSchema } from "./buildSchema"
import { configSchema } from "./schema"

vi.mock("fs/promises")

describe("buildSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("Given buildJsonSchema function", () => {
    describe("When building JSON schema", () => {
      it("Then should write schema to file", async () => {
        const outputPath = "schema.json"
        await buildJsonSchema(outputPath)

        expect(writeFile).toHaveBeenCalledWith(
          outputPath,
          expect.stringContaining('"$schema"')
        )

        const writtenContent = vi.mocked(writeFile).mock.calls[0]?.[1]
        if (typeof writtenContent !== "string") {
          throw new Error("Written content is not a string")
        }

        const schema: unknown = JSON.parse(writtenContent)
        expect(schema).toMatchObject(
          zodToJsonSchema(
            z.intersection(
              configSchema,
              z.object({
                $schema: z.string(),
              })
            )
          )
        )
      })
    })
  })
})
