import type { Context } from "./interface"
import type { DB } from "../lib/drizzle"
import { loadConfig } from "../config/loadConfig"
import { createDbClient } from "../lib/drizzle"
import { queries } from "../lib/drizzle/queries"
import { startPostgres } from "../lib/postgres/startPostgres"
import { getProjectInfo } from "../project/getProjectInfo"

export const createContext = async (
  configPath: string,
  options: {
    enableQueryLogging?: boolean
  } = {}
): Promise<{
  context: Context
  db: DB
  clean: () => Promise<void>
}> => {
  const { enableQueryLogging = false } = options
  await startPostgres(configPath, loadConfig(configPath))

  const config = loadConfig(configPath)
  const { db, clean } = createDbClient(config.database.url, {
    enableQueryLogging,
  })
  const projectInfo = await getProjectInfo(config.directory)

  const context: Context = {
    configPath,
    config,
    queries: queries(db),
    projectInfo,
  }

  return {
    context,
    db,
    clean,
  }
}
