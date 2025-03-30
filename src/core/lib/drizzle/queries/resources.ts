import { eq } from "drizzle-orm/sql"
import type { DB } from ".."
import { defineQuery } from "../defineQuery"
import { resourcesTable } from "../schema/resources"

export const resourceQueries = (db: DB) =>
  ({
    getPastResource: defineQuery(async (db, args: { filePath: string }) => {
      return await db.query.resources.findFirst({
        where: eq(resourcesTable.filePath, args.filePath),
      })
    }).registerDb(db),

    getByProject: defineQuery(async (db, args: { projectId: string }) => {
      return await db.query.resources.findMany({
        where: eq(resourcesTable.projectId, args.projectId),
      })
    }).registerDb(db),

    insert: defineQuery(
      async (
        db,
        args: {
          projectId: string
          filePath: string
          contentHash: string
          mtime: Date
        }
      ) => {
        return await db
          .insert(resourcesTable)
          .values({
            projectId: args.projectId,
            filePath: args.filePath,
            contentHash: args.contentHash,
            mtime: args.mtime,
          })
          .returning()
      }
    ).registerDb(db),

    updateContentByFilePath: defineQuery(
      async (
        db,
        args: { filePath: string; contentHash: string; mtime: Date }
      ) => {
        return await db
          .update(resourcesTable)
          .set({ contentHash: args.contentHash, mtime: args.mtime })
          .where(eq(resourcesTable.filePath, args.filePath))
      }
    ).registerDb(db),

    deleteByProject: defineQuery(async (db, args: { projectId: string }) => {
      return await db
        .delete(resourcesTable)
        .where(eq(resourcesTable.projectId, args.projectId))
    }).registerDb(db),
  }) as const
