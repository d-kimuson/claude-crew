import { findRelevantDocuments } from "../../embedding/findRelevantDocuments"
import { findRelevantResources } from "../../embedding/findRelevantResources"
import { withDb } from "../../lib/drizzle/withDb"

export const ragTools = withDb((ctx) => {
  return {
    findRelevantDocuments: async (query: string) => {
      return await findRelevantDocuments(ctx)(query)
    },

    findRelevantResources: async (query: string) => {
      return await findRelevantResources(ctx)(query)
    },
  } as const
})
