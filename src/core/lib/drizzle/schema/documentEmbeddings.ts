import {
  text,
  varchar,
  pgTable,
  jsonb,
  vector,
  index,
} from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import { tableNames } from "../tableNames"
import { documentsTable } from "./documents"

export const documentEmbeddingsTable = pgTable(
  tableNames.documentEmbeddings,
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    documentId: varchar("document_id", { length: 191 })
      .references(() => documentsTable.id)
      .notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    metadata: jsonb("metadata"),
  },
  (table) => [
    index("documentEmbeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
)
