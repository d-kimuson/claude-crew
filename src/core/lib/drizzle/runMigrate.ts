import { resolve } from "node:path"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import { logger } from "../../../lib/logger"

const getMigrationsFolder = () => {
  return resolve(import.meta.dirname, "migrations")
}

export const runMigrate = async (databaseUrl: string) => {
  const connection = postgres(databaseUrl, { max: 1 })

  const db = drizzle(connection)

  logger.info("⏳ Running migrations...")

  const start = Date.now()

  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`)
  await migrate(db, {
    migrationsFolder: getMigrationsFolder(),
  })

  const end = Date.now()

  logger.info(`✅ Migrations completed in ${end - start}ms`)

  process.exit(0)
}
