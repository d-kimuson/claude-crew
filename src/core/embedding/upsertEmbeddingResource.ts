import { stat } from "fs/promises"
import type { NewResourceParams } from "../lib/drizzle/schema/resources"
import { logger } from "../../lib/logger"
import { withContext } from "../context/withContext"
import { resolveEmbeddingAdapter } from "./adapter/resolver"

const documentExtensions = [".md", ".txt", ".mdx", ".mdc"]

export const upsertEmbeddingResource = withContext(
  (ctx) =>
    async ({ projectId, filePath, content }: NewResourceParams) => {
      try {
        const stats = await stat(filePath)

        const adapter = resolveEmbeddingAdapter(ctx)

        let documentId: string | undefined

        if (documentExtensions.some((ext) => filePath.endsWith(ext))) {
          // Store in document knowledge
          // clear past embeddings
          const pastDocument =
            await ctx.queries.documents.getPastDocument.execute({
              filePath,
            })

          if (pastDocument !== undefined) {
            documentId = pastDocument.id
            if (pastDocument.updatedAt.getTime() === stats.mtime.getTime()) {
              logger.info(`Skipped: ${filePath}. Reason: not modified.`)
              return
            }

            await ctx.queries.documentEmbeddings.deleteByDocument.execute({
              documentId: pastDocument.id,
            })

            await ctx.queries.documents.updateContent.execute({
              documentId: pastDocument.id,
              content,
              mtime: stats.mtime,
            })
          } else {
            // insert document and embeddings
            const [document] = await ctx.queries.documents.insert.execute({
              projectId,
              filePath,
              content,
            })

            if (document === undefined) {
              logger.warn(
                `Failed to insert document. skipping embeddings. ${filePath}`
              )
              return
            }

            documentId = document.id
          }

          const embeddings = await adapter.generateFileEmbeddings(
            content,
            filePath
          )

          await ctx.queries.documentEmbeddings.batchInsert.execute({
            embeddings: embeddings.map((embedding) => ({
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              documentId: documentId!,
              content: embedding.content,
              embedding: embedding.embedding,
              metadata: {
                filePath,
                startLine: embedding.startLine,
                endLine: embedding.endLine,
              },
            })),
          })
          logger.info(`Indexed: ${filePath}`)
        } else {
          let resourceId: string | undefined

          // Store in resources
          // clear past embeddings
          const pastResource =
            await ctx.queries.resources.getPastResource.execute({
              filePath,
            })

          if (pastResource !== undefined) {
            resourceId = pastResource.id
            if (pastResource.updatedAt.getTime() === stats.mtime.getTime()) {
              logger.info(`Skipped (not modified): ${filePath}`)
              return
            }

            await ctx.queries.embeddings.deleteByResource.execute({
              resourceId: pastResource.id,
            })

            await ctx.queries.resources.updateContentByFilePath.execute({
              filePath,
              content,
              mtime: stats.mtime,
            })
          } else {
            // insert resource and embeddings
            const [resource] = await ctx.queries.resources.insert.execute({
              projectId,
              filePath,
              content,
            })

            if (resource === undefined) {
              logger.warn(
                `Failed to insert resource. skipping embeddings. ${filePath}`
              )
              return
            }

            resourceId = resource.id
          }

          const embeddings = await adapter.generateFileEmbeddings(
            content,
            filePath
          )

          await ctx.queries.embeddings.batchInsert.execute({
            embeddings: embeddings.map((embedding) => ({
              resourceId: resourceId,
              content: embedding.content,
              embedding: embedding.embedding,
              metadata: {
                filePath,
                startLine: embedding.startLine,
                endLine: embedding.endLine,
              },
            })),
          })

          logger.info(`Indexed: ${filePath}`)
        }
      } catch (e) {
        logger.error("Error upsert embedding resource", e)
        return
      }
    }
)
