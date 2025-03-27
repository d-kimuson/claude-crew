import { z } from "zod"
import { createDbContext } from "../../core/lib/drizzle/createDbContext"
import { ragTools as coreRagTools } from "../../core/tools/rag"
import { defineTool } from "../utils/defineTool"

export const ragTools = [
  defineTool({
    name: `find-relevant-documents`,
    description: `Find relevant documents based on a query`,
    inputSchema: z.object({
      query: z.string().describe("Search query"),
    }),
    execute: async ({ config }, input) => {
      try {
        const dbContext = createDbContext(config.database.url)
        const result = await coreRagTools(config)(
          dbContext
        ).findRelevantDocuments(input.query)
        return result
      } catch (error) {
        console.error("Error in find-relevant-documents:", error)
        return {
          success: false,
          error: "Failed to find relevant documents",
        }
      }
    },
  }),

  defineTool({
    name: `find-relevant-resources`,
    description: `Find relevant resources based on a query`,
    inputSchema: z.object({
      query: z.string().describe("Search query"),
    }),
    execute: async ({ config }, input) => {
      try {
        const dbContext = createDbContext(config.database.url)
        const result = await coreRagTools(config)(
          dbContext
        ).findRelevantResources(input.query)
        return result
      } catch (error) {
        console.error("Error in find-relevant-resources:", error)
        return {
          success: false,
          error: "Failed to find relevant resources",
        }
      }
    },
  }),
]
