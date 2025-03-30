import { eq } from "drizzle-orm/sql"
import type { DB } from ".."
import { defineQuery } from "../defineQuery"
import { projectsTable } from "../schema/projects"

export const projectQueries = (db: DB) =>
  ({
    getByDirectory: defineQuery(async (db, args: { directory: string }) => {
      return await db.query.projects.findFirst({
        where: eq(projectsTable.directory, args.directory),
      })
    }).registerDb(db),

    insert: defineQuery(async (db, args: { directory: string }) => {
      return await db
        .insert(projectsTable)
        .values({ directory: args.directory })
        .returning()
    }).registerDb(db),
  }) as const
