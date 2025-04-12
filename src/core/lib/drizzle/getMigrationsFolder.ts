import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

export const getMigrationsFolder = () => {
  const isDevelopment = process.env["CLAUDE_CREW_DEVELOPMENT"] === "true"

  if (isDevelopment) {
    return resolve(
      fileURLToPath(import.meta.url),
      "..",
      "..",
      "..",
      "..",
      "..",
      "drizzle",
      "migrations"
    )
  }

  return resolve(fileURLToPath(import.meta.url), "..", "migrations")
}
