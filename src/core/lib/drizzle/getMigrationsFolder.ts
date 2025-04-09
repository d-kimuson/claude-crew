import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

export const getMigrationsFolder = () => {
  return resolve(fileURLToPath(import.meta.url), "..", "migrations")
}
