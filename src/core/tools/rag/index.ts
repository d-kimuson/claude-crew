import { findRelevantDocuments } from "../../embedding/findRelevantDocuments"
import { findRelevantResources } from "../../embedding/findRelevantResources"
import { withDb } from "../../lib/drizzle/withDb"
import { withConfig } from "../../utils/withConfig"

export const ragTools = withConfig((config) =>
  withDb((ctx) => {
    return {
      findRelevantDocuments: async (query: string) => {
        return await findRelevantDocuments(config)(ctx)(query)
      },

      findRelevantResources: async (query: string) => {
        return await findRelevantResources(config)(ctx)(query)
      },
    } as const
  })
)
