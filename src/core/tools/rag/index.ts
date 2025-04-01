import type { InternalToolResult } from "../interface"
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
