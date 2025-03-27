import { createDbClient } from "./index"

export const createDbContext = (databaseUrl: string) => {
  const { db } = createDbClient(databaseUrl)

  return {
    db,
    databaseUrl,
  }
}
