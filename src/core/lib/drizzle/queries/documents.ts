import { eq } from "drizzle-orm/sql"
import type { DB } from ".."
import { defineQuery } from "../defineQuery"
import { documentsTable } from "../schema/documents"

export const documentQueries = (db: DB) =>
  ({
    getPastDocument: defineQuery(async (db, args: { filePath: string }) => {
      return await db.query.documents.findFirst({
        where: eq(documentsTable.filePath, args.filePath),
      })
    }).registerDb(db),

    getByProject: defineQuery(async (db, args: { projectId: string }) => {
      return await db.query.documents.findMany({
        where: eq(documentsTable.projectId, args.projectId),
      })
    }).registerDb(db),

    insert: defineQuery(
      async (
        db,
        args: {
          projectId: string
          filePath: string
          content: string
        }
      ) => {
        return await db
          .insert(documentsTable)
          .values({
            projectId: args.projectId,
            filePath: args.filePath,
            content: args.content,
          })
          .returning()
      }
    ).registerDb(db),

    updateContent: defineQuery(
      async (
        db,
        args: { documentId: string; content: string; mtime: Date }
      ) => {
        return await db
          .update(documentsTable)
          .set({ content: args.content, updatedAt: args.mtime })
          .where(eq(documentsTable.id, args.documentId))
      }
    ).registerDb(db),

    deleteByProject: defineQuery(async (db, args: { projectId: string }) => {
      return await db
        .delete(documentsTable)
        .where(eq(documentsTable.projectId, args.projectId))
    }).registerDb(db),
  }) as const
