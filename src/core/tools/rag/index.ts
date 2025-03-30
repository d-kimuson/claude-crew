import { withContext } from "../../context/withContext"
import { findRelevantDocuments } from "../../embedding/findRelevantDocuments"
import { findRelevantResources } from "../../embedding/findRelevantResources"

export const ragTools = withContext((ctx) => {
  return {
    findRelevantDocuments: async (query: string) => {
      return await findRelevantDocuments(ctx)(query)
    },

    findRelevantResources: async (query: string) => {
      return await findRelevantResources(ctx)(query)
    },
  } as const
})
