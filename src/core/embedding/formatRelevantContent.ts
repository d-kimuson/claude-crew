import { z } from "zod"

export type RelevantContentResult = {
  id: string
  resourceId: string | null
  content: string
  embedding: number[]
  metadata: unknown
  similarity: number
}

export const formatRelevantContent = (
  contents: readonly RelevantContentResult[]
) =>
  contents
    .map(({ metadata, content }) => {
      const parsedMetadata = z
        .object({
          filePath: z.string(),
          startLine: z.number(),
          endLine: z.number(),
        })
        .parse(metadata)

      const name = `${parsedMetadata.filePath}#L${parsedMetadata.startLine}~L${parsedMetadata.endLine}`
      return `<${name}>\n${content}\n</${name}>`
    })
    .join("\n\n")
