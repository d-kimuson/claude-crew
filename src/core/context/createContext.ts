import type { Context } from "./interface"
import { loadConfig } from "../config/loadConfig"
import { createDbClient } from "../lib/drizzle"
import { queries } from "../lib/drizzle/queries"
import { startPostgres } from "../lib/postgres/startPostgres"

export const createContext = async (configPath: string): Promise<Context> => {
  await startPostgres(configPath, loadConfig(configPath))

  const config = loadConfig(configPath)
  const { db } = createDbClient(config.database.url)

  return {
    configPath,
    config,
    queries: queries(db),
  }
}
