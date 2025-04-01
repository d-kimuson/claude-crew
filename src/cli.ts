import { mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import type { Config } from "./core/config/schema"
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
import { startRepl } from "./replSetup/repl"
import { createSnippet } from "./snippet/createSnippet"

const commands = {
  setup: "setup",
  serveMcp: "serve-mcp",
  setupDb: "setup-db",
  clean: "clean",
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
    .help()

  const argv = await cli.argv

  logger.setRuntime("cli")

  switch (argv._[0]) {
    case commands.setup: {
      const { answers } = await startRepl()
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
          checks: answers.checkCommands,
          checkFiles: answers.checkFilesCommands,
        },
        shell: {
          enable: false,
          allowedCommands: [],
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
          enabled: answers.enableEmbedding,
          provider: {
            type: "openai",
            apiKey: answers.enableEmbedding ? answers.openaiApiKey : "",
            model: "text-embedding-ada-002",
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
      logger.info("All setup completed!")
      logger.info("To start task, process the followings.")
      logger.info(
        `1. copy ${resolve(projectDirectory, ".claude-crew", "mcp.json")} and paste to Claude Desktop's MCP config file.`
      )
      logger.info(
        `2. Create Claude Projects for this project, and copy the ${resolve(projectDirectory, ".claude-crew", "instruction.md")} to the Claude Projects's instruction.`
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
      if (context.config.embedding.enabled) {
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
        enableQueryLogging: true,
      })

      await runMigrate(db)
      if (context.config.embedding.enabled) {
        await indexCodebase(context)
      } else {
        logger.info("Embedding is disabled, skipping indexing codebase")
      }

      await clean()
      break
    }

    case commands.clean: {
      logger.info("Starting cleanup process...")
      cleanPostgres()
      break
    }

    case commands.createSnippet: {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- yargs の型定義の制限により必要
      const disableSendEnter = argv["disable-send-enter"] as boolean
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- yargs の型定義の制限により必要
      const outfile = argv["outfile"] as string
      const snippet = createSnippet({ disableSendEnter })

      const outputPath = outfile.startsWith("/")
        ? outfile
        : resolve(process.cwd(), outfile)
      // create parent directory
      await mkdir(dirname(outputPath), { recursive: true })
      await writeFile(outputPath, snippet, "utf-8")
      logger.info(`Snippet has been written to: ${outputPath}`)
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
