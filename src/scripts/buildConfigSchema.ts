import { resolve } from "node:path"
import { buildJsonSchema } from "../core/config/buildSchema"

await buildJsonSchema(resolve(process.cwd(), "config-schema.json"))
