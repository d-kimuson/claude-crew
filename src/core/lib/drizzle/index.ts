import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import { logger } from "../../../lib/logger"
import { documentEmbeddingsTable } from "./schema/documentEmbeddings"
import { documentsTable } from "./schema/documents"
import { embeddingsTable } from "./schema/embeddings"
import { projectsTable } from "./schema/projects"
import { resourcesTable } from "./schema/resources"

const schema = {
  projects: projectsTable,
  resources: resourcesTable,
  embeddings: embeddingsTable,
  documents: documentsTable,
  documentEmbeddings: documentEmbeddingsTable,
} as const

export const createDbClient = (databaseUrl: string) => {
  const client = postgres(databaseUrl)

  const db: PostgresJsDatabase<typeof schema> = drizzle(client, {
    schema: schema,
    logger: false,
  })

  return {
    db,
    client,
  }
}

export type DB = PostgresJsDatabase<typeof schema>
