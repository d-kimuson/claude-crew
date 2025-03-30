import { resolve } from "node:path"
import { sql } from "drizzle-orm"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import type { DB } from "."
import { logger } from "../../../lib/logger"
import { serializeError } from "../../errors/serializeError"

const getMigrationsFolder = () => {
  return resolve(import.meta.dirname, "migrations")
}

export const runMigrate = async (db: DB) => {
  try {
    logger.info("⏳ Running migrations...")

    const start = Date.now()

    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`)
    await migrate(db, {
      migrationsFolder: getMigrationsFolder(),
    })

    const end = Date.now()

    logger.info(`✅ Migrations completed in ${end - start}ms`)
  } catch (error) {
    logger.error("Failed to runMigrations", {
      error: serializeError(error),
    })
  }
}
