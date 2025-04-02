import chalk from "chalk"
import { sql } from "drizzle-orm"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import ora from "ora"
import type { DB } from "."
import { logger } from "../../../lib/logger"
import { serializeError } from "../../errors/serializeError"
import { getMigrationsFolder } from "./getMigrationsFolder"

export const runMigrate = async (db: DB) => {
  try {
    logger.title("Database Migrations")

    const spinner = ora("Running migrations...").start()
    const start = Date.now()

    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`)
    await migrate(db, {
      migrationsFolder: getMigrationsFolder(),
    })

    const end = Date.now()
    const duration = end - start

    spinner.succeed(`Migrations completed in ${chalk.cyan(`${duration}ms`)}`)
  } catch (error) {
    logger.error("Failed to run migrations", {
      error: serializeError(error),
    })
  }
}
