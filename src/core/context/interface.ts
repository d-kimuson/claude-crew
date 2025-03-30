import type { Config } from "../config/schema"
import type { Queries } from "../lib/drizzle/queries"

export type Context = {
  configPath: string
  config: Config
  queries: Queries
}
