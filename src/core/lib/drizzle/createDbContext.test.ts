import { describe, it, expect, vi } from "vitest"
import type { DB } from "./index"
import type { Sql } from "postgres"
import { createDbClient } from "./index"
import { createDbContext } from "./createDbContext"

vi.mock("./index", () => ({
  createDbClient: vi.fn(),
}))

describe("createDbContext", () => {
  describe("Given a database URL", () => {
    const mockDatabaseUrl = "postgres://user:pass@localhost:5432/db"

    describe("When creating a database context", () => {
      it("Then should return db instance and database URL", () => {
        const mockDb = {
          query: vi.fn(),
          _: {},
          $with: vi.fn(),
          $count: vi.fn(),
          with: vi.fn(),
        } as unknown as DB

        const mockClient = {
          CLOSE: vi.fn(),
          END: vi.fn(),
          PostgresError: Error,
          options: {} as Record<string, unknown>,
        } as unknown as Sql<Record<string, unknown>>

        vi.mocked(createDbClient).mockReturnValue({
          db: mockDb,
          client: mockClient,
        })

        const result = createDbContext(mockDatabaseUrl)

        expect(createDbClient).toHaveBeenCalledWith(mockDatabaseUrl)
        expect(result).toEqual({
          db: mockDb,
          databaseUrl: mockDatabaseUrl,
        })
      })
    })
  })
})
