import { mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import chalk from "chalk"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { z } from "zod"
import type { Config } from "./core/config/schema"
import { loadConfig } from "./core/config/loadConfig"
import { mcpConfig } from "./core/config/mcp"
import { writeConfig } from "./core/config/writeConfig"
import { createContext } from "./core/context/createContext"
import { indexCodebase } from "./core/embedding/indexCodebase"
import { runMigrate } from "./core/lib/drizzle/runMigrate"
import { cleanPostgres } from "./core/lib/postgres/cleanPostgres"
import { createPostgresConfig } from "./core/lib/postgres/startPostgres"
import { createPrompt } from "./core/prompt/createPrompt"
import { logger } from "./lib/logger"
import { startMcpServer } from "./mcp-server"
import { isIntegrationEnabled } from "./mcp-server/integrations/isIntegrationEnabled"
import { startRepl } from "./replSetup/repl"
import { createSnippet } from "./snippet/createSnippet"

const commands = {
  setup: "setup",
  setupDb: "setup-db",
  clean: "clean",
  serveMcp: "serve-mcp",
  createInstruction: "create-instruction",
  createSnippet: "create-snippet",
} as const

export const main = async () => {
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
    .command(
      `${commands.setupDb} <config-path>`,
      "Setup the database",
      (setupDb) => {
        setupDb
          .positional("config-path", { type: "string", demandOption: true })
          .help()
      }
    )
    .command(
      `${commands.clean}`,
      "Remove containers and volumes, revert to pre setup-db state",
      (clean) => {
        clean.help()
      }
    )
    .command(
      `${commands.createSnippet}`,
      "Create a snippet for Claude Desktop",
      (createSnippet) => {
        createSnippet
          .option("disable-send-enter", {
            type: "boolean",
            description: "Disable sending message on Enter key press",
            default: false,
          })
          .option("outfile", {
            type: "string",
            description: "Output file path",
            default: "claude_crew_snippet.js",
          })
          .help()
      }
    )
    .command(
      `${commands.createInstruction} <config-path>`,
      "Create instruction file from config",
      (createInstruction) => {
        createInstruction
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

  logger.setRuntime("cli")

  switch (argv._[0]) {
    case commands.setup: {
      logger.title("Setting up Claude Crew")
      logger.step(1, 5, "Starting project configuration")

      const { answers } = await startRepl()
      const projectDirectory: string = answers.directory.startsWith("/")
        ? answers.directory
        : resolve(process.cwd(), answers.directory)

      logger.step(2, 5, "Creating configuration files")

      const spinner = logger.spinner("Generating project configuration...")
      const config: Config = {
        name: answers.name,
        directory: projectDirectory,
        language: answers.language,
        commands: {
          install: answers.installCommand,
          build: answers.buildCommand,
          test: answers.testCommand,
          testFile: answers.testFileCommand,
          checks: answers.checkCommands,
          checkFiles: answers.checkFilesCommands,
        },
        git: {
          defaultBranch: answers.gitDefaultBranch,
          autoPull: true,
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
        integrations: answers.integration.map((name) => {
          switch (name) {
            case "typescript": {
              const tsconfigPath = z.string().parse(answers.tsConfigPath)

              return {
                name: "typescript",
                config: {
                  tsConfigFilePath: tsconfigPath.startsWith("/")
                    ? tsconfigPath
                    : resolve(projectDirectory, tsconfigPath),
                },
              } as const
            }
            case "rag":
              return {
                name: "rag",
                config: {
                  provider: {
                    type: "openai",
                    apiKey: z.string().parse(answers.openaiApiKey),
                    model: "text-embedding-ada-002",
                  },
                },
              } as const
            case "shell":
              return {
                name: "shell",
                config: {
                  allowedCommands: z
                    .string()
                    .parse(answers.allowedCommands)
                    .split(",")
                    .map((command) => command.trim())
                    .filter((command) => command !== ""),
                },
              } as const
            default:
              throw new Error(`Unsupported integration: ${String(name)}`)
          }
        }),
      }
      spinner.succeed("Configuration generated successfully!")

      logger.step(3, 5, "Writing configuration and instruction files")

      const configDirSpinner = logger.spinner(
        `Creating configuration directory at ${chalk.cyan(".claude-crew")}...`
      )
      await mkdir(resolve(projectDirectory, ".claude-crew"), {
        recursive: true,
      })
      configDirSpinner.succeed("Configuration directory created!")

      const writeConfigSpinner = logger.spinner(
        `Writing configuration files at ${chalk.cyan(".claude-crew")}...`
      )
      await writeConfig(
        resolve(projectDirectory, ".claude-crew", "config.json"),
        config
      )
      await writeFile(
        resolve(projectDirectory, ".claude-crew", "mcp.json"),
        JSON.stringify(mcpConfig(config), null, 2)
      )
      writeConfigSpinner.succeed("Configuration files written successfully!")

      const instructionSpinner = logger.spinner(
        "Generating instruction file..."
      )
      const prompt = createPrompt(config)
      await writeFile(
        resolve(projectDirectory, ".claude-crew", "instruction.md"),
        prompt
      )
      instructionSpinner.succeed("Instruction file created!")

      logger.step(4, 5, "Setting up database")

      const { context, db, clean } = await createContext(
        resolve(projectDirectory, ".claude-crew", "config.json"),
        {
          enableQueryLogging: false,
        }
      )

      await runMigrate(db)
      if (isIntegrationEnabled(context)("rag")) {
        await indexCodebase(context)
      } else {
        logger.info("Embedding is disabled, skipping indexing codebase")
      }

      await clean()

      logger.step(5, 5, "Setup completed")

      logger.box(
        `
Setup completed successfully! 🎉

To start using Claude Crew, follow these steps:

1. Copy ${chalk.cyan(resolve(projectDirectory, ".claude-crew", "mcp.json"))} 
   and paste to Claude Desktop's MCP config file.

2. Create Claude Projects for this project, and copy 
   ${chalk.cyan(resolve(projectDirectory, ".claude-crew", "instruction.md"))} 
   to the Claude Projects's instruction.
   
3. [Optional] Create a snippet for Claude Desktop by executing the following command.
   ${chalk.cyan(`$ npx claude-crew@latest create-snippet --disable-send-enter`)}`,
        {
          borderColor: "green",
          title: "Setup Complete",
          titleAlignment: "center",
        }
      )
      break
    }

    case commands.serveMcp: {
      // stdout logging should be disabled because MCP server using stdout
      logger.setRuntime("mcp-server")
      // some messages are written in spite of LoopLogger, so override stdout.write
      // eslint-disable-next-line @typescript-eslint/unbound-method -- It's fine because we're just returning to a method with the same 'this'
      const originalWrite = process.stdout.write
      process.stdout.write = (content) => {
        logger.info(content.toString())
        return true
      }

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const configPath = argv["configPath"] as string
      const { context, db } = await createContext(configPath, {
        enableQueryLogging: false,
      })

      logger.setLogFilePath(
        resolve(context.config.directory, ".claude-crew", "mcp-server.log")
      )

      await runMigrate(db)
      if (isIntegrationEnabled(context)("rag")) {
        await indexCodebase(context)
      } else {
        logger.info("Embedding is disabled, skipping indexing codebase")
      }

      process.stdout.write = originalWrite
      await startMcpServer(context)
      break
    }

    case commands.setupDb: {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const configPath = argv["configPath"] as string
      const { context, db, clean } = await createContext(configPath, {
        enableQueryLogging: false,
      })

      await runMigrate(db)
      if (isIntegrationEnabled(context)("rag")) {
        await indexCodebase(context)
      } else {
        logger.info("Embedding is disabled, skipping indexing codebase")
      }

      await clean()
      break
    }

    case commands.clean: {
      logger.title("Claude Crew Cleanup")
      cleanPostgres()
      break
    }

    case commands.createSnippet: {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- yargs の型定義の制限により必要
      const disableSendEnter = argv["disable-send-enter"] as boolean
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- yargs の型定義の制限により必要
      const outfile = argv["outfile"] as string

      logger.title("Creating Claude Desktop Snippet")

      const spinner = logger.spinner("Generating snippet...")
      const snippet = createSnippet({ disableSendEnter })

      const outputPath = outfile.startsWith("/")
        ? outfile
        : resolve(process.cwd(), outfile)

      // create parent directory
      await mkdir(dirname(outputPath), { recursive: true })
      await writeFile(outputPath, snippet, "utf-8")

      spinner.succeed(`Snippet created successfully!`)

      logger.box(
        `
Snippet has been written to:
${chalk.cyan(outputPath)}

To use this snippet:
1. Open Claude Desktop
2. Press ${chalk.yellow("Cmd + Alt + Shift + i")} to open Developer Console
3. Paste the snippet contents and press Enter
`,
        {
          borderColor: "green",
          title: "Snippet Created",
          titleAlignment: "center",
        }
      )
      break
    }

    case commands.createInstruction: {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const configPath = argv["configPath"] as string

      logger.title("Creating Claude Instruction")

      const spinner = logger.spinner("Loading configuration...")
      const config = loadConfig(configPath)
      spinner.succeed("Configuration loaded!")

      const promptSpinner = logger.spinner("Generating instructions...")
      const prompt = createPrompt(config)
      await writeFile(
        resolve(config.directory, ".claude-crew", "instruction.md"),
        prompt
      )
      promptSpinner.succeed("Instruction file created!")

      logger.box(
        `
Instruction file has been created at:
${chalk.cyan(resolve(config.directory, ".claude-crew", "instruction.md"))}
`,
        {
          borderColor: "green",
          title: "Success",
          titleAlignment: "center",
        }
      )
      break
    }

    default:
      cli.showHelp()
  }
}

await main().catch((error) => {
  logger.error("Error in CLI", error)
  process.exit(1)
})
