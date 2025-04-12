import { sql } from "drizzle-orm/sql"
import { logger } from "../../../lib/logger"
import { allTables, type DB } from "."

export const resetMigrate = async (db: DB) => {
  for (const table of allTables) {
    await db.execute(sql`DROP TABLE IF EXISTS ${table} CASCADE;`)
  }

  await db.execute(sql`DROP TABLE "drizzle"."__drizzle_migrations";`)
  logger.success("✅ Successfully cleaned up migrations")
}
