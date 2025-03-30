import { z } from "zod"
import { serializeError } from "../../core/errors/serializeError"
import { createDbContext } from "../../core/lib/drizzle/createDbContext"
import { ragTools as coreRagTools } from "../../core/tools/rag"
import { logger } from "../../lib/logger"
import { defineTool } from "../utils/defineTool"

export const ragTools = [
  defineTool(({ server, config }) =>
    server.tool(
      `${config.name}-find-relevant-documents`,
      `Find relevant documents based on a query`,
      {
        query: z.string().describe("Search query"),
      },
      async (input) => {
        try {
          const dbContext = createDbContext(config.database.url)
          const result = await coreRagTools(config)(
            dbContext
          ).findRelevantDocuments(input.query)
          return {
            isError: false,
            content: [{ type: "text", text: JSON.stringify(result) }],
          }
        } catch (error) {
          logger.error("Error in find-relevant-documents:", error)
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
  ),

  defineTool(({ server, config }) =>
    server.tool(
      `${config.name}-find-relevant-resources`,
      `Find relevant resources based on a query`,
      {
        query: z.string().describe("Search query"),
      },
      async (input) => {
        try {
          const dbContext = createDbContext(config.database.url)
          const result = await coreRagTools(config)(
            dbContext
          ).findRelevantResources(input.query)
          return {
            isError: false,
            content: [{ type: "text", text: JSON.stringify(result) }],
          }
        } catch (error) {
          logger.error("Error in find-relevant-resources:", error)
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
  ),
]
