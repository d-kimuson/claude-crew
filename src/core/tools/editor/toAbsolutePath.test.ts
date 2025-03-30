import { resolve } from "node:path"
import { describe, it, expect } from "vitest"
import type { Config } from "../../config/schema"
import { toAbsolutePath } from "./toAbsolutePath"

describe("toAbsolutePath", () => {
  const mockConfig: Config = {
    name: "test-project",
    directory: "/test/project",
    language: "日本語",
    commands: {
      install: "pnpm i",
      build: "pnpm build",
      test: "pnpm test",
      testFile: "pnpm vitest run <file>",
      checks: ["pnpm tsc -p . --noEmit"],
      checkFiles: ["pnpm eslint <files>"],
    },
    shell: {
      enable: false,
      allowedCommands: [],
    },
    git: {
      defaultBranch: "main",
      branchPrefix: "claude-crew/",
    },
    github: {
      createPullRequest: "draft",
    },
    database: {
      customDb: false,
      url: "postgresql://localhost:5432/test",
      port: 5432,
    },
    embedding: {
      provider: {
        type: "openai",
        apiKey: "test-api-key",
        model: "text-embedding-ada-002",
      },
    },
  }

  const toAbsolutePathWithConfig = toAbsolutePath(mockConfig)

  describe("Given a file path", () => {
    describe("When the path is absolute", () => {
      it("Then should return the path unchanged", () => {
        const absolutePath = "/absolute/path/to/file.ts"
        expect(toAbsolutePathWithConfig(absolutePath)).toBe(absolutePath)
      })
    })

    describe("When the path is relative", () => {
      it("Then should resolve the path relative to the config directory", () => {
        const relativePath = "relative/path/to/file.ts"
        const expectedPath = resolve(mockConfig.directory, relativePath)
        expect(toAbsolutePathWithConfig(relativePath)).toBe(expectedPath)
      })
    })
  })
})
