import { eq, inArray } from "drizzle-orm/sql"
import type { NewResourceParams } from "../lib/drizzle/schema/resources"
import { logger } from "../../lib/logger"
import { withContext } from "../context/withContext"
import { documentEmbeddingsTable } from "../lib/drizzle/schema/documentEmbeddings"
import { documentsTable } from "../lib/drizzle/schema/documents"
import { embeddingsTable } from "../lib/drizzle/schema/embeddings"
import { resourcesTable } from "../lib/drizzle/schema/resources"
import { resolveEmbeddingAdapter } from "./adapter/resolver"

const documentExtensions = [".md", ".txt", ".mdx", ".mdc"]

export const upsertEmbeddingResource = withContext(
  (ctx) =>
    async ({ projectId, filePath, content }: NewResourceParams) => {
      try {
        const adapter = await resolveEmbeddingAdapter(ctx)
        const embeddings = await adapter.generateFileEmbeddings(
          content,
          filePath
        )

        if (documentExtensions.some((ext) => filePath.endsWith(ext))) {
          // Store in document knowledge
          // clear past embeddings
          const pastDocuments = await ctx.db
            .select()
            .from(documentsTable)
            .where(eq(documentsTable.filePath, filePath))
          await ctx.db.delete(documentEmbeddingsTable).where(
            inArray(
              documentEmbeddingsTable.documentId,
              pastDocuments.map((document) => document.id)
            )
          )
          await ctx.db
            .delete(documentsTable)
            .where(eq(documentsTable.filePath, filePath))

          // insert document and embeddings
          const [document] = await ctx.db
            .insert(documentsTable)
            .values({ projectId, filePath, content })
            .returning()

          if (document === undefined) {
            logger.warn(
              `Failed to insert document. skipping embeddings. ${filePath}`
            )
            return
          }

          await ctx.db.insert(documentEmbeddingsTable).values(
            embeddings.map((embedding) => ({
              documentId: document.id,
              content: embedding.content,
              embedding: embedding.embedding,
              metadata: {
                filePath,
                startLine: embedding.startLine,
                endLine: embedding.endLine,
              },
            }))
          )
        } else {
          // Store in resources
          // clear past embeddings
          const pastResources = await ctx.db
            .select()
            .from(resourcesTable)
            .where(eq(resourcesTable.filePath, filePath))
          await ctx.db.delete(embeddingsTable).where(
            inArray(
              embeddingsTable.resourceId,
              pastResources.map((resource) => resource.id)
            )
          )

          // insert resource and embeddings
          const [resource] = await ctx.db
            .insert(resourcesTable)
            .values({ projectId, filePath, content })
            .returning()

          await ctx.db.insert(embeddingsTable).values(
            embeddings.map((embedding) => ({
              resourceId: resource?.id,
              content: embedding.content,
              embedding: embedding.embedding,
              metadata: {
                filePath,
                startLine: embedding.startLine,
                endLine: embedding.endLine,
              },
            }))
          )
        }

        return "Resource successfully created and embedded."
      } catch (e) {
        if (e instanceof Error)
          return e.message.length > 0 ? e.message : "Error, please try again."
      }
    }
)
