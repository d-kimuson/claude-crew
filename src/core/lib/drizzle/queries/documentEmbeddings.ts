import { cosineDistance, desc, eq, gt, inArray, sql } from "drizzle-orm/sql"
import type { DB } from ".."
import type { Embedding } from "../../../embedding/adapter/interface"
import { defineQuery } from "../defineQuery"
import { documentEmbeddingsTable } from "../schema/documentEmbeddings"

export const documentEmbeddingsQueries = (db: DB) =>
  ({
    searchRelevant: defineQuery(
      async (
        db,
        args: { queryEmbedding: Embedding; threshold: number; limit: number }
      ) => {
        const similarity = sql<number>`1 - (${cosineDistance(
          documentEmbeddingsTable.embedding,
          args.queryEmbedding
        )})`

        return await db
          .select({
            id: documentEmbeddingsTable.id,
            documentId: documentEmbeddingsTable.documentId,
            content: documentEmbeddingsTable.content,
            embedding: documentEmbeddingsTable.embedding,
            metadata: documentEmbeddingsTable.metadata,
            similarity,
          })
          .from(documentEmbeddingsTable)
          .where(gt(similarity, args.threshold))
          .orderBy((t) => desc(t.similarity))
          .limit(args.limit)
      }
    ).registerDb(db),

    batchInsert: defineQuery(
      async (
        db,
        args: {
          embeddings: readonly {
            documentId: string
            content: string
            embedding: Embedding
            metadata: {
              filePath: string
              startLine: number
              endLine: number
            }
          }[]
        }
      ) => {
        return await db
          .insert(documentEmbeddingsTable)
          .values(
            args.embeddings.map((embedding) => ({
              documentId: embedding.documentId,
              content: embedding.content,
              embedding: embedding.embedding,
              metadata: {
                filePath: embedding.metadata.filePath,
                startLine: embedding.metadata.startLine,
                endLine: embedding.metadata.endLine,
              },
            }))
          )
          .returning()
      }
    ).registerDb(db),

    deleteByDocument: defineQuery(async (db, args: { documentId: string }) => {
      return await db
        .delete(documentEmbeddingsTable)
        .where(eq(documentEmbeddingsTable.documentId, args.documentId))
    }).registerDb(db),

    deleteByDocuments: defineQuery(
      async (db, args: { documentIds: string[] }) => {
        return await db
          .delete(documentEmbeddingsTable)
          .where(inArray(documentEmbeddingsTable.documentId, args.documentIds))
      }
    ).registerDb(db),
  }) as const
