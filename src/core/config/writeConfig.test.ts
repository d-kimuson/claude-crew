import { existsSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import { describe, it, expect, vi } from "vitest"
import type { Config } from "./schema"
import { writeConfig } from "./writeConfig"

vi.mock("node:fs")
vi.mock("node:fs/promises")
vi.mock("node:path")

describe("writeConfig", () => {
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
        type: "xenova",
      },
    },
  }

  beforeEach(() => {
    vi.mocked(dirname).mockReturnValue("/test/config")
    vi.mocked(existsSync).mockReturnValue(false)
  })

  describe("Given a config object", () => {
    describe("When writing to a new directory", () => {
      it("Then should create directory and write config", async () => {
        const configPath = "/test/config/config.json"

        await writeConfig(configPath, mockConfig)

        expect(dirname).toHaveBeenCalledWith(configPath)
        expect(existsSync).toHaveBeenCalledWith("/test/config")
        expect(mkdir).toHaveBeenCalledWith("/test/config", { recursive: true })
        expect(writeFile).toHaveBeenCalledWith(
          configPath,
          JSON.stringify(
            {
              $schema:
                "https://raw.githubusercontent.com/d-kimuson/claude-crew/refs/heads/main/config-schema.json",
              ...mockConfig,
            },
            null,
            2
          )
        )
      })
    })

    describe("When writing to an existing directory", () => {
      it("Then should write config without creating directory", async () => {
        vi.mocked(existsSync).mockReturnValue(true)
        const configPath = "/test/config/config.json"

        await writeConfig(configPath, mockConfig)

        expect(dirname).toHaveBeenCalledWith(configPath)
        expect(existsSync).toHaveBeenCalledWith("/test/config")
        expect(mkdir).not.toHaveBeenCalled()
        expect(writeFile).toHaveBeenCalledWith(
          configPath,
          JSON.stringify(
            {
              $schema:
                "https://raw.githubusercontent.com/d-kimuson/claude-crew/refs/heads/main/config-schema.json",
              ...mockConfig,
            },
            null,
            2
          )
        )
      })
    })

    describe("When directory creation fails", () => {
      it("Then should throw an error", async () => {
        vi.mocked(mkdir).mockRejectedValue(new Error("Permission denied"))
        const configPath = "/test/config/config.json"

        await expect(writeConfig(configPath, mockConfig)).rejects.toThrow(
          "Permission denied"
        )
      })
    })

    describe("When file write fails", () => {
      it("Then should throw an error", async () => {
        vi.mocked(writeFile).mockRejectedValue(new Error("Permission denied"))
        const configPath = "/test/config/config.json"

        await expect(writeConfig(configPath, mockConfig)).rejects.toThrow(
          "Permission denied"
        )
      })
    })
  })
})
