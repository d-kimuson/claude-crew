import type { DB } from "."

export type DbContext = { db: DB; databaseUrl: string }

export const withDb = <T>(cb: (context: DbContext) => T) => cb
