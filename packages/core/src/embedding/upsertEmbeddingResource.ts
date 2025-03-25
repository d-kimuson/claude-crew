import { eq, inArray } from "drizzle-orm/sql"
import type { NewResourceParams } from "../lib/drizzle/schema/resources"
import { documentEmbeddingsTable } from "../lib/drizzle/schema/documentEmbeddings"
import { documentsTable } from "../lib/drizzle/schema/documents"
import { embeddingsTable } from "../lib/drizzle/schema/embeddings"
import { resourcesTable } from "../lib/drizzle/schema/resources"
import { withDb } from "../lib/drizzle/withDb"
import { generateEmbeddings } from "./generateEmbeddings"

const documentExtensions = [".md", ".txt", ".mdx", ".mdc"]

export const upsertEmbeddingResource = withDb(
  ({ db }) =>
    async ({ projectId, filePath, content }: NewResourceParams) => {
      try {
        const embeddings = await generateEmbeddings(content, filePath)

        if (documentExtensions.some((ext) => filePath.endsWith(ext))) {
          // ドキュメント knowledge に格納
          // clear past embeddings
          const pastDocuments = await db
            .select()
            .from(documentsTable)
            .where(eq(documentsTable.filePath, filePath))
          await db.delete(documentEmbeddingsTable).where(
            inArray(
              documentEmbeddingsTable.documentId,
              pastDocuments.map((document) => document.id)
            )
          )
          await db
            .delete(documentsTable)
            .where(eq(documentsTable.filePath, filePath))

          // insert document and embeddings
          const [document] = await db
            .insert(documentsTable)
            .values({ projectId, filePath, content })
            .returning()

          if (document === undefined) {
            console.warn(
              `Failed to insert document. skipping embeddings. ${filePath}`
            )
            return
          }

          await db.insert(documentEmbeddingsTable).values(
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
          // リソースに格納
          // clear past embeddings
          const pastResources = await db
            .select()
            .from(resourcesTable)
            .where(eq(resourcesTable.filePath, filePath))
          await db.delete(embeddingsTable).where(
            inArray(
              embeddingsTable.resourceId,
              pastResources.map((resource) => resource.id)
            )
          )

          // insert resource and embeddings
          const [resource] = await db
            .insert(resourcesTable)
            .values({ projectId, filePath, content })
            .returning()

          await db.insert(embeddingsTable).values(
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
