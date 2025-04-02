import { resolve } from "node:path"

export const getMigrationsFolder = () => {
  return resolve(import.meta.dirname, "migrations")
}
