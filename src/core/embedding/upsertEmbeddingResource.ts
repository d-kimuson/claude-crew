import { stat } from "fs/promises"
import { eq } from "drizzle-orm/sql"
import type { NewResourceParams } from "../lib/drizzle/schema/resources"
import { logger } from "../../lib/logger"
import { documentEmbeddingsTable } from "../lib/drizzle/schema/documentEmbeddings"
import { documentsTable } from "../lib/drizzle/schema/documents"
import { embeddingsTable } from "../lib/drizzle/schema/embeddings"
import { resourcesTable } from "../lib/drizzle/schema/resources"
import { withDb } from "../lib/drizzle/withDb"
import { withConfig } from "../utils/withConfig"
import { resolveEmbeddingAdapter } from "./adapter/resolver"

const documentExtensions = [".md", ".txt", ".mdx", ".mdc"]

export const upsertEmbeddingResource = withConfig((config) =>
  withDb(
    ({ db }) =>
      async ({ projectId, filePath, content }: NewResourceParams) => {
        try {
          const stats = await stat(filePath)

          const adapter = resolveEmbeddingAdapter(config)

          let documentId: string | undefined

          if (documentExtensions.some((ext) => filePath.endsWith(ext))) {
            // Store in document knowledge
            // clear past embeddings
            const pastDocument = await db.query.documents.findFirst({
              where: eq(documentsTable.filePath, filePath),
            })

            if (pastDocument !== undefined) {
              documentId = pastDocument.id
              if (pastDocument.updatedAt.getTime() === stats.mtime.getTime()) {
                logger.info(`Skipped: ${filePath}. Reason: not modified.`)
                return
              }

              await db
                .delete(documentEmbeddingsTable)
                .where(eq(documentEmbeddingsTable.documentId, pastDocument.id))

              await db
                .update(documentsTable)
                .set({
                  content,
                  updatedAt: stats.mtime,
                })
                .where(eq(documentsTable.filePath, filePath))
            } else {
              // insert document and embeddings
              const [document] = await db
                .insert(documentsTable)
                .values({ projectId, filePath, content })
                .returning()

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

            await db.insert(documentEmbeddingsTable).values(
              embeddings.map((embedding) => ({
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                documentId: documentId!,
                content: embedding.content,
                embedding: embedding.embedding,
                metadata: {
                  filePath,
                  startLine: embedding.startLine,
                  endLine: embedding.endLine,
                },
              }))
            )
            logger.info(`Indexed: ${filePath}`)
          } else {
            let resourceId: string | undefined

            // Store in resources
            // clear past embeddings
            const pastResource = await db.query.resources.findFirst({
              where: eq(resourcesTable.filePath, filePath),
            })

            if (pastResource !== undefined) {
              resourceId = pastResource.id
              if (pastResource.updatedAt.getTime() === stats.mtime.getTime()) {
                logger.info(`Skipped (not modified): ${filePath}`)
                return
              }

              await db
                .delete(embeddingsTable)
                .where(eq(embeddingsTable.resourceId, pastResource.id))

              await db
                .update(resourcesTable)
                .set({
                  content,
                  updatedAt: stats.mtime,
                })
                .where(eq(resourcesTable.filePath, filePath))
            } else {
              // insert resource and embeddings
              const [resource] = await db
                .insert(resourcesTable)
                .values({ projectId, filePath, content })
                .returning()

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

            await db.insert(embeddingsTable).values(
              embeddings.map((embedding) => ({
                resourceId: resourceId,
                content: embedding.content,
                embedding: embedding.embedding,
                metadata: {
                  filePath,
                  startLine: embedding.startLine,
                  endLine: embedding.endLine,
                },
              }))
            )

            logger.info(`Indexed: ${filePath}`)
          }
        } catch (e) {
          logger.error("Error upsert embedding resource", e)
          return
        }
      }
  )
)
