import type { DB } from "."

export const withDb = <T>(cb: (context: { db: DB }) => T) => cb
