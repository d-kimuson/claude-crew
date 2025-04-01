import type { Config } from "../../src/core/config/schema"
import type { Context } from "../../src/core/context/interface"
import type { PartialDeep } from "type-fest"

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
  embedding: {
    enabled: true,
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

type CompleteKeys = "config" | "configPath"
type MockContextType = Pick<Context, CompleteKeys> &
  PartialDeep<Pick<Context, Exclude<keyof Context, CompleteKeys>>>

const defaultContext = {
  configPath: `${defaultConfig.directory}/.claude-crew/config.json`,
  config: defaultConfig,
  queries: {},
  projectInfo: {
    dependencies: {},
    devDependencies: {},
    packageManager: "pnpm",
  },
} as const satisfies MockContextType

export const contextFactory = (
  changes?: (baseContext: MockContextType) => MockContextType
): Context => {
  const context = changes ? changes(defaultContext) : defaultContext
  return context as Context
}
