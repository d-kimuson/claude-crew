import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { describe, it, expect, vi } from "vitest"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import type { Sql } from "postgres"
import { createDbClient } from "./index"
import { documentEmbeddingsTable } from "./schema/documentEmbeddings"
import { documentsTable } from "./schema/documents"
import { embeddingsTable } from "./schema/embeddings"
import { projectsTable } from "./schema/projects"
import { resourcesTable } from "./schema/resources"

vi.mock("postgres", () => ({
  default: vi.fn(),
}))

vi.mock("drizzle-orm/postgres-js", () => ({
  drizzle: vi.fn(),
}))

describe("createDbClient", () => {
  describe("Given a database URL", () => {
    const mockDatabaseUrl = "postgres://user:pass@localhost:5432/db"

    describe("When creating a database client", () => {
      it("Then should initialize PostgreSQL client and return db instance with client", () => {
        const mockClient = {
          CLOSE: vi.fn(),
          END: vi.fn(),
          PostgresError: Error,
          options: {} as Record<string, unknown>,
          parameters: {},
          types: {},
          typed: vi.fn(),
          unsafe: vi.fn(),
          array: vi.fn(),
          begin: vi.fn(),
          end: vi.fn(),
          listen: vi.fn(),
          notify: vi.fn(),
          subscribe: vi.fn(),
          unsubscribe: vi.fn(),
        } as unknown as Sql<Record<string, unknown>>

        const mockDb = {
          query: vi.fn(),
          _: {},
          $with: vi.fn(),
          $count: vi.fn(),
          with: vi.fn(),
          select: vi.fn(),
          selectDistinct: vi.fn(),
          selectDistinctOn: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
          insert: vi.fn(),
          $client: mockClient,
        } as unknown as PostgresJsDatabase<{
          projects: typeof projectsTable
          resources: typeof resourcesTable
          embeddings: typeof embeddingsTable
          documents: typeof documentsTable
          documentEmbeddings: typeof documentEmbeddingsTable
        }>

        vi.mocked(postgres).mockReturnValue(mockClient)
        // @ts-expect-error -- ignore
        vi.mocked(drizzle).mockReturnValue(mockDb)

        const result = createDbClient(mockDatabaseUrl)

        expect(postgres).toHaveBeenCalledWith(mockDatabaseUrl)
        expect(drizzle).toHaveBeenCalledWith(mockClient, {
          schema: {
            projects: projectsTable,
            resources: resourcesTable,
            embeddings: embeddingsTable,
            documents: documentsTable,
            documentEmbeddings: documentEmbeddingsTable,
          },
        })
        expect(result).toEqual({
          db: mockDb,
          client: mockClient,
        })
      })
    })
  })
})
