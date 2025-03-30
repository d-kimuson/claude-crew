import { z } from "zod"
import { loadConfig } from "../../core/config/loadConfig"
import { serializeError } from "../../core/errors/serializeError"
import { createDbContext } from "../../core/lib/drizzle/createDbContext"
import { startPostgres } from "../../core/lib/postgres/startPostgres"
import { prepareTask } from "../../core/project/prepare"
import { defineTool } from "../utils/defineTool"

export const prepareTool = defineTool(({ server, config, configPath }) =>
  server.tool(
    `${config.name}-prepare`,
    "Prepare the project for the next task",
    {
      branch: z.string().describe("branch name for the task"),
      documentQuery: z.string().describe("query to fetch relevant documents"),
      resourceQuery: z.string().describe("query to fetch relevant resources"),
    },
    async (args) => {
      try {
        const { branch, documentQuery, resourceQuery } = args
        await startPostgres(configPath, config)
        const updatedConfig = loadConfig(configPath)
        const ctx = createDbContext(updatedConfig.database.url)
        const result = await prepareTask(updatedConfig)(ctx)(
          branch,
          documentQuery,
          resourceQuery
        )

        return {
          isError: false,
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        }
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${JSON.stringify(serializeError(error))}`,
            },
          ],
        }
      }
    }
  )
)
