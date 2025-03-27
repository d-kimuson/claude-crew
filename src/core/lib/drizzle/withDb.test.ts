import { describe, it, expect, vi } from "vitest"
import type { DB } from "."
import type { DbContext } from "./withDb"
import { withDb } from "./withDb"

describe("withDb", () => {
  describe("Given a callback function", () => {
    describe("When the callback is executed with a DbContext", () => {
      it("Then should return the callback result", () => {
        const mockDb = { exec: vi.fn() } as unknown as DB
        const mockDbContext: DbContext = {
          db: mockDb,
          databaseUrl: "postgresql://user:password@localhost:5432/dbName",
        }

        const mockCallback = (context: DbContext) =>
          `Database URL: ${context.databaseUrl}`

        const dbFn = withDb(mockCallback)
        const result = dbFn(mockDbContext)

        expect(result).toBe(
          "Database URL: postgresql://user:password@localhost:5432/dbName"
        )
      })
    })

    describe("When callback uses the DB object", () => {
      it("Then should provide DB to the callback", () => {
        const mockDb = {
          query: {
            documents: {
              findMany: vi.fn().mockReturnValue(["result1", "result2"]),
            },
          },
          exec: vi.fn(),
        } as unknown as DB

        const mockDbContext: DbContext = {
          db: mockDb,
          databaseUrl: "postgresql://localhost:5432/dbName",
        }

        const dbFn = withDb((context) => {
          const results = context.db.query.documents.findMany()
          return results
        })

        const result = dbFn(mockDbContext)

        expect(result).toEqual(["result1", "result2"])
        expect(mockDb.query.documents.findMany).toHaveBeenCalled()
      })
    })
  })
})
