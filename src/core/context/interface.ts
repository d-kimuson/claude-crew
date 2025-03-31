import type { Config } from "../config/schema"
import type { Queries } from "../lib/drizzle/queries"
import type { ProjectInfo } from "../project/getProjectInfo"
export type Context = {
  configPath: string
  config: Config
  projectInfo: ProjectInfo
  queries: Queries
}
