import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import inquirer from "inquirer"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import type { Config } from "./core/config/schema"
import { mcpConfig } from "./core/config/mcp"
import { writeConfig } from "./core/config/writeConfig"
import { createPostgresConfig } from "./core/lib/postgres/startPostgres"
import { createPrompt } from "./core/prompt/createPrompt"
import { startMcpServer } from "./mcp-server"

const commands = {
  setup: "setup",
  serveMcp: "serve-mcp",
} as const

const main = async () => {
  const cli = yargs(hideBin(process.argv))
    .command(commands.setup, "Setup the project", (setup) => {
      setup
        .option("container", {
          type: "boolean",
          description: "run in container",
          default: false,
        })
        .option("postgres-url", {
          type: "string",
          description: "postgres url",
        })
        .help()
    })
    .command(
      `${commands.serveMcp} <config-path>`,
      "Serve the MCP server",
      (serveMcp) => {
        serveMcp
          .positional("config-path", {
            type: "string",
            description: "Configuration file path",
            demandOption: true,
          })
          .help()
      }
    )
    .help()

  const argv = await cli.argv

  switch (argv._[0]) {
    case commands.setup: {
      type SetupAnswers = {
        directory: string
        name: string
        language: string
        installCommand: string
        buildCommand: string
        testCommand: string
        testFileCommand: string
        checkCommand: string
        checkFilesCommand: string
        defaultBranch: string
        branchPrefix: string
        githubPullRequest: "always" | "draft" | "never"
        runtime: "local" | "container"
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

      const answers = await inquirer.prompt<SetupAnswers>([
        {
          type: "input",
          name: "directory",
          message: "Input project directory",
          default: ".",
        },
        {
          type: "input",
          name: "name",
          message: "Input project name",
        },
        {
          type: "input",
          name: "language",
          message: "Input language to communicate with you",
          default: "日本語",
        },
        {
          type: "input",
          name: "installCommand",
          message: "Input install command",
          default: "pnpm i",
        },
        {
          type: "input",
          name: "buildCommand",
          message: "Input build command",
          default: "pnpm build",
        },
        {
          type: "input",
          name: "testCommand",
          message: "Input full test command",
          default: "pnpm test",
        },
        {
          type: "input",
          name: "testFileCommand",
          message:
            "Input full test file command. <file> is replaced by the file name.",
          default: "pnpm vitest run <file>",
        },
        {
          type: "input",
          name: "checkCommand",
          message: "Input check command",
          default: "pnpm tsc -p . --noEmit",
        },
        {
          type: "input",
          name: "checkFilesCommand",
          message:
            "Input check files command. <files> is replaced by the file names.",
          default: "pnpm eslint <files>",
        },
        {
          type: "input",
          name: "defaultBranch",
          message: "Input default branch",
          default: "main",
        },
        {
          type: "input",
          name: "branchPrefix",
          message: "Input branch prefix",
          default: "claude-crew/",
        },
        {
          type: "select",
          name: "githubPullRequest",
          message: "Allow claude to create pull request?",
          choices: ["always", "draft", "never"],
          default: "draft",
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
          default: false,
        },
        {
          type: "input",
          name: "databaseUrl",
          message: "Input database URL",
          when: (answers) => answers.customDb,
        },
      ])

      const projectDirectory: string = answers.directory.startsWith("/")
        ? answers.directory
        : resolve(process.cwd(), answers.directory)

      const config: Config = {
        name: answers.name,
        directory: projectDirectory,
        language: answers.language,
        commands: {
          install: answers.installCommand,
          build: answers.buildCommand,
          test: answers.testCommand,
          testFile: answers.testFileCommand,
          checks: [answers.checkCommand],
          checkFiles: [answers.checkFilesCommand],
        },
        shell: {
          enable: false,
          allowedCommands: [],
        },
        git: {
          defaultBranch: answers.defaultBranch,
          branchPrefix: answers.branchPrefix,
        },
        github: {
          createPullRequest: answers.githubPullRequest,
        },
        database: answers.customDb
          ? {
              customDb: true,
              url: answers.databaseUrl,
            }
          : {
              customDb: false,
              ...(await createPostgresConfig()),
            },
        embedding: {
          provider: {
            type: "xenova",
          },
        },
      }

      await mkdir(resolve(projectDirectory, ".claude-crew"), {
        recursive: true,
      })
      await writeConfig(
        resolve(projectDirectory, ".claude-crew", "config.json"),
        config
      )
      await writeFile(
        resolve(projectDirectory, ".claude-crew", "mcp.json"),
        JSON.stringify(mcpConfig(config), null, 2)
      )

      const prompt = createPrompt(config)
      await writeFile(
        resolve(projectDirectory, ".claude-crew", "instruction.md"),
        prompt
      )
      console.log("All setup completed!")
      console.log("To start task, process the followings.")
      console.log(
        `1. copy ${resolve(projectDirectory, ".claude-crew", "mcp.json")} and paste to Claude Desktop's MCP config file.`
      )
      console.log(
        "2. Create Claude Projects for this project, and copy the instruction.md to the Claude Projects's instruction."
      )
      break
    }

    case commands.serveMcp: {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const configPath = argv["configPath"] as string
      await startMcpServer(configPath)
      break
    }

    default:
      cli.showHelp()
  }
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
