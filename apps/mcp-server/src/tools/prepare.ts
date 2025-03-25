import { writeFile } from "fs/promises"
import {
  createDbContext,
  loadConfig,
  prepareTask,
  startPostgres,
} from "@claude-crew/core"
import { z } from "zod"
import { envUtils } from "../envUtils"
import { defineTool } from "../utils/defineTool"

export const prepareTool = defineTool({
  name: "prepare",
  description: "Prepare the project for the next task",
  inputSchema: z.object({
    branch: z.string().describe("branch name for the task"),
    query: z
      .string()
      .describe("query to fetch relevant documents and resources"),
  }),
  execute: async (_config, input) => {
    const { branch, query } = input
    const config = loadConfig(envUtils.getEnv("CONFIG_PATH"))

    const url = config.database.customDb
      ? config.database.url
      : await startPostgres().then(({ url }) => url)

    if (url !== config.database.url) {
      await writeFile(
        envUtils.getEnv("CONFIG_PATH"),
        JSON.stringify(
          {
            ...config,
            database: {
              ...config.database,
              url,
            },
          },
          null,
          2
        )
      )
    }

    const ctx = createDbContext(url)
    await prepareTask(config)(ctx)(branch, query)
  },
})
