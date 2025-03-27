import { readFileSync } from "node:fs"
import { configSchema } from "./schema"

export const loadConfig = (path: string) => {
  const config = configSchema.parse(JSON.parse(readFileSync(path, "utf-8")))
  return config
}
