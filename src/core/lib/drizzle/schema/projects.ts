import { varchar, pgTable } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import { tableNames } from "../tableNames"

export const projectsTable = pgTable(tableNames.projects, {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  directory: varchar("directory", { length: 256 }).notNull(),
})
