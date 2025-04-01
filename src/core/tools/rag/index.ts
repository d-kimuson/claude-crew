import type { InternalToolResult } from "../interface"
import { logger } from "../../../lib/logger"
import { isIntegrationEnabled } from "../../../mcp-server/integrations/isIntegrationEnabled"
import { withContext } from "../../context/withContext"
import { findRelevantDocuments } from "../../embedding/findRelevantDocuments"
import { findRelevantResources } from "../../embedding/findRelevantResources"
import { formatRagContents } from "../../embedding/formatRagContents"

export const ragTools = withContext((ctx) => {
  return {
    findRelevantDocuments: async (
      query: string
    ): Promise<InternalToolResult> => {
      try {
        // Check if embedding is enabled
        if (!isIntegrationEnabled(ctx)("rag")) {
          logger.info(
            "Embedding is disabled, returning empty relevant documents"
          )
          return {
            success: false,
            error: {
              message: "Embedding feature is disabled",
            },
          }
        }

        return {
          success: true,
          content: formatRagContents(await findRelevantDocuments(ctx)(query)),
        }
      } catch (error: unknown) {
        return {
          success: false,
          error,
        } as const
      }
    },

    findRelevantResources: async (
      query: string
    ): Promise<InternalToolResult> => {
      try {
        // Check if embedding is enabled
        if (!isIntegrationEnabled(ctx)("rag")) {
          logger.info(
            "Embedding is disabled, returning empty relevant resources"
          )
          return {
            success: false,
            error: {
              message: "Embedding feature is disabled",
            },
          }
        }

        return {
          success: true,
          content: formatRagContents(await findRelevantResources(ctx)(query)),
        }
      } catch (error: unknown) {
        return {
          success: false,
          error,
        } as const
      }
    },
  } as const
})
