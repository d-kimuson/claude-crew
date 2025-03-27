import { z } from "zod"
import { loadConfig } from "../../core/config/loadConfig"
import { createDbContext } from "../../core/lib/drizzle/createDbContext"
import { startPostgres } from "../../core/lib/postgres/startPostgres"
import { prepareTask } from "../../core/project/prepare"
import { defineTool } from "../utils/defineTool"

export const prepareTool = defineTool({
  name: "prepare",
  description: "Prepare the project for the next task",
  inputSchema: z.object({
    branch: z.string().describe("branch name for the task"),
    documentQuery: z.string().describe("query to fetch relevant documents"),
    resourceQuery: z.string().describe("query to fetch relevant resources"),
  }),
  execute: async ({ config, configPath }, input) => {
    const { branch, documentQuery, resourceQuery } = input
    await startPostgres(configPath, config)
    const updatedConfig = loadConfig(configPath)
    const ctx = createDbContext(updatedConfig.database.url)
    const result = await prepareTask(updatedConfig)(ctx)(
      branch,
      documentQuery,
      resourceQuery
    )

    return result
  },
})
