import type { DB } from "."
import { logger } from "../../../lib/logger"

export const defineQuery = <Args, Ret>(cb: (db: DB, args: Args) => Ret) => {
  const registerDb = (db: DB) => {
    const execute = async (args: Args) => {
      try {
        return await cb(db, args)
      } catch (error) {
        logger.error("Error executing query", { error })
        throw error
      }
    }

    return {
      execute,
    }
  }

  return {
    registerDb,
  }
}
