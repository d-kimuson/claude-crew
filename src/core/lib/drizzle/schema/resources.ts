import { varchar, timestamp, pgTable, uniqueIndex } from "drizzle-orm/pg-core"
import { createSelectSchema } from "drizzle-zod"
import { nanoid } from "nanoid"
import type { z } from "zod"
import { tableNames } from "../tableNames"
import { projectsTable } from "./projects"

export const resourcesTable = pgTable(
  tableNames.resources,
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    projectId: varchar("project_id", { length: 191 })
      .references(() => projectsTable.id)
      .notNull(),
    filePath: varchar("file_path", { length: 1024 }).notNull(),
    contentHash: varchar("content_hash", { length: 191 }).notNull(),
    mtime: timestamp("mtime", { withTimezone: true }).notNull(),
  },
  (t) => [
    uniqueIndex("resources-file-path-project-id").on(t.filePath, t.projectId),
  ]
)

export const resourceInputSchema = createSelectSchema(resourcesTable).extend({})

export type ResourceInput = z.infer<typeof resourceInputSchema>
