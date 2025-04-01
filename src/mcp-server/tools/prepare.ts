import { fillPrompt } from "type-safe-prompt"
import { z } from "zod"
import { serializeError } from "../../core/errors/serializeError"
import { getOrCreateMemoryBank } from "../../core/memory-bank/getOrCreateMemoryBank"
import { prepareTask } from "../../core/project/prepare"
import { defineTool } from "../utils/defineTool"

const prepareResponseTemplate = `
## ProjectInfo

<project-info>
{{projectInfo}}
</project-info>

## Relevant Documents

<relevant-documents>
{{relevantDocuments}}
</relevant-documents>

## Relevant Resources

<relevant-resources>
{{relevantResources}}
</relevant-resources>

## MemoryBank

<memory-bank>
{{memoryBank}}
</memory-bank>
`

export const prepareTool = defineTool(({ server, ...ctx }) => {
  const name = `${ctx.config.name}-prepare`
  const description = "Prepare the project for the next task"

  return ctx.config.embedding.enabled
    ? server.tool(
        name,
        description,
        {
          documentQuery: z
            .string()
            .describe("query to fetch relevant documents"),
          resourceQuery: z
            .string()
            .describe("query to fetch relevant resources"),
        },
        async (args) => {
          try {
            const { documentQuery, resourceQuery } = args
            const result = await prepareTask(ctx)({
              documentQuery,
              resourceQuery,
            })
            const memoryBank = await getOrCreateMemoryBank(ctx)

            return {
              isError: false,
              content: [
                {
                  type: "text",
                  text: fillPrompt(prepareResponseTemplate, {
                    projectInfo: JSON.stringify(result.projectInfo),
                    relevantDocuments: result.relevantDocuments ?? "",
                    relevantResources: result.relevantResources ?? "",
                    memoryBank: memoryBank,
                  }),
                },
              ],
            }
          } catch (error) {
            return {
              isError: true,
              content: [
                {
                  type: "text",
                  text: `Error: ${JSON.stringify(serializeError(error))}\n\nPlease ask the user to review their environment setup.`,
                },
              ],
            }
          }
        }
      )
    : server.tool(name, description, {}, async () => {
        try {
          const result = await prepareTask(ctx)()
          const memoryBank = await getOrCreateMemoryBank(ctx)

          return {
            isError: false,
            content: [
              {
                type: "text",
                text: fillPrompt(prepareResponseTemplate, {
                  projectInfo: JSON.stringify(result.projectInfo),
                  relevantDocuments: "Nothing (because embedding is disabled)",
                  relevantResources: "Nothing (because embedding is disabled)",
                  memoryBank: memoryBank,
                }),
              },
            ],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Error: ${JSON.stringify(serializeError(error))}\n\nPlease ask the user to review their environment setup.`,
              },
            ],
          }
        }
      })
})
