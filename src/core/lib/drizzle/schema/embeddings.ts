import {
  index,
  jsonb,
  pgTable,
  text,
  varchar,
  vector,
} from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import { tableNames } from "../tableNames"
import { resourcesTable } from "./resources"

export const embeddingsTable = pgTable(
  tableNames.embeddings,
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resourceId: varchar("resource_id", { length: 191 }).references(
      () => resourcesTable.id,
      { onDelete: "cascade" }
    ),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    metadata: jsonb("metadata"),
  },
  (table) => [
    index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
)
