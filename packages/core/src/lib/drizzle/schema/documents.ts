import { text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core"
import { createSelectSchema } from "drizzle-zod"
import { nanoid } from "nanoid"
import type { z } from "zod"
import { projectsTable } from "./projects"

/**
 * ドキュメント（Markdown, 企画書, 仕様書など想定）
 *  - プロジェクトIDで紐づく
 *  - タイトルや記事本文などを保持
 */
export const documentsTable = pgTable("documents", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  projectId: varchar("project_id", { length: 191 })
    .references(() => projectsTable.id)
    .notNull(),
  filePath: varchar("file_path", { length: 1024 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

// Schema for documents - used to validate API requests
export const insertDocumentSchema = createSelectSchema(documentsTable)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
  })

// Type for documents - used to type API request params and within Components
export type NewDocumentParams = z.infer<typeof insertDocumentSchema>
