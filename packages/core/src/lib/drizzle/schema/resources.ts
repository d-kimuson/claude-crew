import { sql } from "drizzle-orm"
import { text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core"
import { createSelectSchema } from "drizzle-zod"
import { nanoid } from "nanoid"
import type { z } from "zod"
import { projectsTable } from "./projects"

export const resourcesTable = pgTable("resources", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  projectId: varchar("project_id", { length: 191 })
    .references(() => projectsTable.id)
    .notNull(),
  filePath: varchar("file_path", { length: 1024 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
})

// Schema for resources - used to validate API requests
export const insertResourceSchema = createSelectSchema(resourcesTable)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })

// Type for resources - used to type API request params and within Components
export type NewResourceParams = z.infer<typeof insertResourceSchema>
