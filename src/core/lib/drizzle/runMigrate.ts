import chalk from "chalk"
import { sql } from "drizzle-orm"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import type { DB } from "."
import { logger } from "../../../lib/logger"
import { serializeError } from "../../errors/serializeError"
import { getMigrationsFolder } from "./getMigrationsFolder"

export const runMigrate = async (db: DB) => {
  logger.title("Database Migrations")

  const spinner = logger.spinner("Running migrations...")
  try {
    const start = Date.now()

    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`)
    await migrate(db, {
      migrationsFolder: getMigrationsFolder(),
    })

    const end = Date.now()
    const duration = end - start

    spinner.succeed(`Migrations completed in ${chalk.cyan(`${duration}ms`)}`)
  } catch (error) {
    spinner.fail(
      `Failed to run migrations\n\nerror: ${JSON.stringify(serializeError(error), null, 2)}`
    )
    throw error
  }
}
