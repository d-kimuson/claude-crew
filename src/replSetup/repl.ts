import { resolve } from "node:path"
import inquirer from "inquirer"
import { loadConfig } from "../core/config/loadConfig"
import { logger } from "../lib/logger"

type SetupAnswers = {
  name: string
  language: string
  installCommand: string
  buildCommand: string
  testCommand: string
  testFileCommand: string
  checkCommand: string
  checkFilesCommand: string
  runtime: "local" | "container"
  openaiApiKey: string
} & (
  | {
      customDb: true
      databaseUrl: string
      databasePort: number
    }
  | {
      customDb: false
      databaseUrl?: undefined
      databasePort?: undefined
    }
)

export const startRepl = async () => {
  const directory = await inquirer
    .prompt<{
      directory: string
    }>({
      type: "input",
      name: "directory",
      message: "Input project directory",
      default: ".",
    })
    .then((answer) => {
      return answer.directory.startsWith("/")
        ? resolve(answer.directory)
        : resolve(process.cwd(), answer.directory)
    })

  const existingConfig = (() => {
    try {
      logger.info(
        `Existing config found at ${resolve(directory, ".claude-crew", "config.json")}`
      )
      return loadConfig(resolve(directory, ".claude-crew", "config.json"))
    } catch {
      return null
    }
  })()

  const answers = await inquirer.prompt<SetupAnswers>([
    {
      type: "input",
      name: "name",
      message: "Input project name",
      default: existingConfig?.name,
    },
    {
      type: "input",
      name: "language",
      message: "Input language to communicate with you",
      default: existingConfig?.language ?? "日本語",
    },
    {
      type: "input",
      name: "installCommand",
      message: "Input install command",
      default: existingConfig?.commands.install ?? "pnpm i",
    },
    {
      type: "input",
      name: "buildCommand",
      message: "Input build command",
      default: existingConfig?.commands.build ?? "pnpm build",
    },
    {
      type: "input",
      name: "testCommand",
      message: "Input full test command",
      default: existingConfig?.commands.test ?? "pnpm test",
    },
    {
      type: "input",
      name: "testFileCommand",
      message:
        "Input full test file command. <file> is replaced by the file name.",
      default: existingConfig?.commands.testFile ?? "pnpm vitest run <file>",
    },
    {
      type: "input",
      name: "checkCommand",
      message: "Input check command",
      default:
        existingConfig?.commands.checks.at(0) ?? "pnpm tsc -p . --noEmit",
    },
    {
      type: "input",
      name: "checkFilesCommand",
      message:
        "Input check files command. <files> is replaced by the file names.",
      default:
        existingConfig?.commands.checkFiles.at(1) ?? "pnpm eslint <files>",
    },
    {
      type: "select",
      name: "runtime",
      message: "Select runtime (local is recommended)",
      choices: ["local", "container"],
      default: "local",
    },
    {
      type: "confirm",
      name: "customDb",
      message: "Use custom database?",
      default: existingConfig?.database.customDb ?? false,
    },
    {
      type: "input",
      name: "databaseUrl",
      message: "Input database URL",
      when: (answers) => answers.customDb,
      default: existingConfig?.database.url,
    },
    {
      type: "password",
      name: "openaiApiKey",
      message: "Input your OpenAI API key",
      default:
        existingConfig?.embedding?.provider.type === "openai"
          ? existingConfig?.embedding?.provider.apiKey
          : undefined,
      validate: (input: string) => {
        if (!input) return "API key is required"
        if (!input.startsWith("sk-"))
          return "Invalid API key format. OpenAI API keys start with 'sk-'"
        return true
      },
    },
  ])

  return {
    answers,
  }
}
