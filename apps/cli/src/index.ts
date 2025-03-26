import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { createPrompt, mcpConfig, startPostgres } from "@claude-crew/core"
import inquirer from "inquirer"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import type { Config } from "@claude-crew/core"
import { startMcpServer } from "./mcp-server"

const commands = {
  setup: "setup",
  serveMcp: "serve-mcp",
} as const

const main = async () => {
  const argv = await yargs(hideBin(process.argv))
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
    .help().argv

  switch (argv._[0]) {
    case commands.setup: {
      const answers = await inquirer.prompt([
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
          type: "input",
          name: "openaiKey",
          message: "Input your OpenAI API Key for create embedding.",
        },
        {
          type: "select",
          name: "runtime",
          message: "Select runtime (local is recommended)",
          choices: ["local", "container"],
          default: "local",
        },
      ])

      // TODO: support container
      const url = await startPostgres().then(({ url }) => url)

      /* eslint-disable */
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
        database: {
          url,
          customDb: false,
        },
        embedding: {
          openAiKey: answers.openaiKey,
        },
      }
      /* eslint-enable */

      await mkdir(resolve(projectDirectory, ".claude-crew"), {
        recursive: true,
      })
      await writeFile(
        resolve(projectDirectory, ".claude-crew", "config.json"),
        JSON.stringify(config, null, 2)
      )
      await writeFile(
        resolve(projectDirectory, ".claude-crew", "mcp.json"),
        JSON.stringify(mcpConfig(config), null, 2)
      )

      const prompt = await createPrompt(config)
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
      await startMcpServer()
      break
    }

    default:
      throw new Error(`Invalid command: ${argv._[0]}`)
  }
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
