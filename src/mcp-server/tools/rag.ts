import { z } from "zod"
import { formatRagContents } from "../../core/embedding/formatRagContents"
import { serializeError } from "../../core/errors/serializeError"
import { ragTools as coreRagTools } from "../../core/tools/rag"
import { logger } from "../../lib/logger"
import { defineTool } from "../utils/defineTool"

export const ragTools = [
  defineTool((ctx) =>
    ctx.server.tool(
      `${ctx.config.name}-find-relevant-documents`,
      `Find relevant documents based on a query`,
      {
        query: z.string().describe("Search query"),
      },
      async (input) => {
        try {
          const result = await coreRagTools(ctx).findRelevantDocuments(
            input.query
          )
          return {
            isError: false,
            content: [{ type: "text", text: formatRagContents(result) }],
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

  defineTool((ctx) =>
    ctx.server.tool(
      `${ctx.config.name}-find-relevant-resources`,
      `Find relevant resources based on a query`,
      {
        query: z.string().describe("Search query"),
      },
      async (input) => {
        try {
          const result = await coreRagTools(ctx).findRelevantResources(
            input.query
          )
          return {
            isError: false,
            content: [{ type: "text", text: formatRagContents(result) }],
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
