import { existsSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { resolve } from "node:path"
import { PGlite } from "@electric-sql/pglite"
import { vector } from "@electric-sql/pglite/vector"
import { NoopLogger } from "drizzle-orm"
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite"
import prexit from "prexit"
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

export const allTables = Object.values(schema)

export type DB = PgliteDatabase<typeof schema>

export const createDbClient = (options: { enableQueryLogging: boolean }) => {
  const client = new PGlite({
    extensions: { vector },
    dataDir: resolve(homedir(), ".claude-crew", "pglite-data"),
  })

  let ended = false

  const clean = async () => {
    if (ended) return
    ended = true
    logger.info("✅ Clean up postgres connection")
    await client.close()
  }

  prexit(async () => {
    await clean()
  })

  if (!existsSync("~/.claude-crew/pglite")) {
    mkdirSync("~/.claude-crew/pglite", { recursive: true })
  }

  const db: DB = drizzle(client, {
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
    clean,
  }
}
