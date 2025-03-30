import { cosineDistance, desc, eq, gt, inArray, sql } from "drizzle-orm/sql"
import type { DB } from ".."
import type { Embedding } from "../../../embedding/adapter/interface"
import { defineQuery } from "../defineQuery"
import { embeddingsTable } from "../schema/embeddings"

export const embeddingQueries = (db: DB) =>
  ({
    searchRelevant: defineQuery(
      async (
        db,
        args: { queryEmbedding: Embedding; threshold: number; limit: number }
      ) => {
        const similarity = sql<number>`1 - (${cosineDistance(
          embeddingsTable.embedding,
          args.queryEmbedding
        )})`

        return await db
          .select({
            id: embeddingsTable.id,
            resourceId: embeddingsTable.resourceId,
            content: embeddingsTable.content,
            embedding: embeddingsTable.embedding,
            metadata: embeddingsTable.metadata,
            similarity,
          })
          .from(embeddingsTable)
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
            resourceId: string
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
          .insert(embeddingsTable)
          .values(
            args.embeddings.map((embedding) => ({
              resourceId: embedding.resourceId,
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

    deleteByResource: defineQuery(async (db, args: { resourceId: string }) => {
      return await db
        .delete(embeddingsTable)
        .where(eq(embeddingsTable.resourceId, args.resourceId))
    }).registerDb(db),

    deleteByResources: defineQuery(
      async (db, args: { resourceIds: string[] }) => {
        return await db
          .delete(embeddingsTable)
          .where(inArray(embeddingsTable.resourceId, args.resourceIds))
      }
    ).registerDb(db),
  }) as const
