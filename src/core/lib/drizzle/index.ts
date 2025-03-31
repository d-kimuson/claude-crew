import { NoopLogger } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import prexit from "prexit"
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

export const createDbClient = (
  databaseUrl: string,
  options: {
    enableQueryLogging: boolean
  }
) => {
  const client = postgres(databaseUrl)

  let ended = false

  const clean = async () => {
    if (ended) return
    ended = true
    logger.info("✅ Clean up postgres connection")
    await client.end()
  }

  prexit(async () => {
    await clean()
  })

  const db: PostgresJsDatabase<typeof schema> = drizzle(client, {
    schema: schema,
    logger:
      options.enableQueryLogging === false
        ? new NoopLogger()
        : {
            logQuery: (query, params) => {
              logger.info("query", { query, params })
            },
          },
  })

  return {
    db,
    client,
    clean,
  }
}

export type DB = PostgresJsDatabase<typeof schema>
