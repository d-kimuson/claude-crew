import { z } from "zod"
import { ragTools as coreRagTools } from "../../core/tools/rag"
import { defineTool } from "../utils/defineTool"
import { toErrorResponse, toResponse } from "../utils/toResponse"

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
          return toResponse(
            await coreRagTools(ctx).findRelevantDocuments(input.query)
          )
        } catch (error) {
          return toErrorResponse(error)
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
          return toResponse(
            await coreRagTools(ctx).findRelevantResources(input.query)
          )
        } catch (error) {
          return toErrorResponse(error)
        }
      }
    )
  ),
]
