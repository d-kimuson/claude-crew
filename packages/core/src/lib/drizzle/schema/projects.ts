import { varchar, pgTable } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

export const projectsTable = pgTable("projects", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: varchar("name", { length: 256 }).notNull(),
})
