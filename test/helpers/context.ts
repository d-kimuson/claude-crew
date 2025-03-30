import type { Config } from "../../src/core/config/schema"
import type { Context } from "../../src/core/context/interface"

const defaultConfig: Config = {
  name: "test-project",
  language: "日本語",
  directory: "/test/project",
  database: {
    customDb: false,
    url: "test-database-url",
    port: 3306,
  },
  commands: {
    install: "pnpm i",
    build: "pnpm build",
    test: "pnpm test",
    testFile: "pnpm vitest run <file>",
    checks: ["pnpm tsc -p . --noEmit"],
    checkFiles: ["pnpm eslint <files>"],
  },
  shell: {
    enable: true,
    allowedCommands: [],
  },
  git: {
    defaultBranch: "main",
    branchPrefix: "feature/",
  },
  github: {
    createPullRequest: "never",
  },
  embedding: {
    provider: {
      type: "openai",
      model: "text-embedding-ada-002",
      apiKey: "dummy-openai-api-key",
    },
  },
}

export const configFactory = (
  changes?: (baseConfig: Config) => Config
): Config => {
  return changes ? changes(defaultConfig) : defaultConfig
}

const defaultContext = {
  configPath: `${defaultConfig.directory}/.claude-crew/config.json`,
  config: defaultConfig,
  db: {},
  dbClient: {},
} as const

export const contextFactory = (
  changes?: (
    baseContext: Pick<Context, "config" | "configPath"> & {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      db: any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dbClient: any
    }
  ) => Partial<Context>
): Context => {
  const context = changes ? changes(defaultContext) : defaultContext
  return context as Context
}
