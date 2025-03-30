import { varchar, pgTable } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

export const projectsTable = pgTable("projects", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  directory: varchar("directory", { length: 256 }).notNull(),
})
