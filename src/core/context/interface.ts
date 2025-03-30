import type { Config } from "../config/schema"
import type { DB } from "../lib/drizzle"
import type postgres from "postgres"

export type Context = {
  configPath: string
  config: Config
  db: DB
  dbClient: postgres.Sql<Record<string, never>>
}
