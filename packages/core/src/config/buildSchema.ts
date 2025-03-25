import { writeFile } from "fs/promises"
import { z } from "zod"
import zodToJsonSchema from "zod-to-json-schema"
import { configSchema } from "./schema"

export const buildJsonSchema = async () => {
  await writeFile(
    "./dist/schema.json",
    JSON.stringify(
      zodToJsonSchema(
        z.intersection(
          configSchema,
          z.object({
            $schema: z.string(),
          })
        )
      ),
      null,
      2
    )
  )
}
