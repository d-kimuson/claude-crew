import { z } from "zod"

const metadataSchema = z.object({
  filePath: z.string(),
  startLine: z.number(),
  endLine: z.number(),
})

export const formatRagContents = (
  contents: {
    content: string
    embedding: number[]
    metadata: unknown
  }[]
) => {
  return contents
    .flatMap(({ metadata, content }) => {
      const parsed = metadataSchema.safeParse(metadata)
      if (!parsed.success) return []

      const { filePath, startLine, endLine } = parsed.data

      const label = `${filePath}#${startLine}~${endLine}`
      return [`<${label}>\n${content}\n</${label}>`]
    })
    .join("\n")
}
