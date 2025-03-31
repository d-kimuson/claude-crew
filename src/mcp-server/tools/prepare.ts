import { z } from "zod"
import { serializeError } from "../../core/errors/serializeError"
import { prepareTask } from "../../core/project/prepare"
import { defineTool } from "../utils/defineTool"

export const prepareTool = defineTool(({ server, ...ctx }) =>
  server.tool(
    `${ctx.config.name}-prepare`,
    "Prepare the project for the next task",
    {
      documentQuery: z.string().describe("query to fetch relevant documents"),
      resourceQuery: z.string().describe("query to fetch relevant resources"),
    },
    async (args) => {
      try {
        const { documentQuery, resourceQuery } = args
        const result = await prepareTask(ctx)(documentQuery, resourceQuery)

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
