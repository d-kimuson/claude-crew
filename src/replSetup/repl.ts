import { resolve } from "node:path"
import inquirer from "inquirer"
import type {
  GetIntegrationConfig,
  IntegrationNames,
} from "../mcp-server/integrations"
import { loadConfig } from "../core/config/loadConfig"
import { logger } from "../lib/logger"
import { integrations } from "../mcp-server/integrations"

const multipleInput = async (
  message: string,
  options?: {
    addAnotherMessage?: string
  }
): Promise<string[]> => {
  const { addAnotherMessage = "Add another?" } = options ?? {}

  const answers = await inquirer.prompt<{
    addAnother: boolean
    value: string
  }>([
    {
      type: "input",
      name: "value",
      message: message,
    },
    {
      type: "confirm",
      name: "addAnother",
      message: addAnotherMessage,
      default: true,
    },
  ])

  if (answers.addAnother) {
    return [
      ...(await multipleInput(message, {
        addAnotherMessage,
      })),
      answers.value,
    ]
  }

  return []
}

export type SetupAnswers = {
  name: string
  language: string
  runtime: "local" | "container"
  enableEmbedding: boolean
  openaiApiKey?: string

  installCommand: string
  buildCommand: string
  testCommand: string
  testFileCommand: string
  gitDefaultBranch: string
  gitAutoPull: boolean
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

export type SetupResult = {
  directory: string
  answers: SetupAnswers
}

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
      return loadConfig(resolve(directory, ".claude-crew", "config.json"))
    } catch {
      return null
    }
  })()

  if (existingConfig !== null) {
    logger.info(
      `Existing config found at ${resolve(directory, ".claude-crew", "config.json")}`
    )
  }

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
      type: "input",
      name: "gitDefaultBranch",
      message: "Input default branch",
      default: existingConfig?.git.defaultBranch ?? "main",
    },
    {
      type: "confirm",
      name: "gitAutoPull",
      message: "Auto pull latest changes?",
      default: existingConfig?.git.autoPull ?? true,
    },
  ])

  const projectCommandAnswers = await inquirer.prompt<{
    installCommand: string
    buildCommand: string
    testCommand: string
    testFileCommand: string
  }>([
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
  ])

  const checkCommands = Array.isArray(existingConfig?.commands.checks)
    ? existingConfig?.commands.checks
    : await multipleInput(
        "Input check command. <command> is replaced by the command.",
        {
          addAnotherMessage: "Add another check?",
        }
      )

  const checkFilesCommands = Array.isArray(existingConfig?.commands.checkFiles)
    ? existingConfig?.commands.checkFiles
    : await multipleInput(
        "Input check files command. <files> is replaced by the file names.",
        {
          addAnotherMessage: "Add another check file?",
        }
      )

  const integrationAnswers = await inquirer.prompt<{
    integration: IntegrationNames[]
    tsConfigPath: string
    openaiApiKey: string
    allowedCommands: string
  }>([
    {
      type: "checkbox",
      name: "integration",
      message: "Select integration",
      choices: integrations.map((integration) => integration.config.name),
      default: existingConfig?.integrations.map(
        (integration) => integration.name
      ),
    },
    {
      type: "input",
      name: "tsConfigPath",
      message: "Input path to tsconfig.json",
      when: (answers) => answers.integration?.includes("typescript"),
      default:
        // prettier-ignore
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (existingConfig?.integrations.find(({ name }) => name === "typescript")
            ?.config as GetIntegrationConfig<"typescript">)
          .tsConfigFilePath ?? resolve(directory, "tsconfig.json"),
    },
    {
      type: "input",
      name: "openaiApiKey",
      message: "Input your OpenAI API key",
      when: (answers) => answers.integration?.includes("rag"),
      default: // prettier-ignore
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      (existingConfig?.integrations.find(({ name }) => name === "rag")
          ?.config as GetIntegrationConfig<"rag"> | undefined)
        ?.provider?.apiKey,
      validate: (input: string) => {
        if (!input) return "API key is required"
        if (!input.startsWith("sk-"))
          return "Invalid API key format. OpenAI API keys start with 'sk-'"
        return true
      },
    },
    {
      type: "input",
      name: "allowedCommands",
      message: "Input allowed commands with comma separated",
      when: (answers) => answers.integration?.includes("shell"),
      default:
        // prettier-ignore
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (existingConfig?.integrations.find(({ name }) => name === "shell")
            ?.config as GetIntegrationConfig<"shell"> | undefined)?.allowedCommands.join(
          ","
        ) ?? "",
    },
  ])

  return {
    answers: {
      directory,
      ...answers,
      ...projectCommandAnswers,
      checkCommands,
      checkFilesCommands,
      ...integrationAnswers,
    },
  }
}
