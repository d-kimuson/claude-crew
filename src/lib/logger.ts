import { appendFileSync } from "node:fs"
import boxen from "boxen"
import chalk from "chalk"
import ora from "ora"
import type { Options } from "boxen"

/* eslint-disable no-console */
export type Runtime = "mcp-server" | "cli" | "debug"

export type Logger = {
  setRuntime: (runtime: Runtime) => void
  setLogFilePath: (path: string) => void
  info: (code: string, structuredData?: unknown) => void
  error: (code: string, structuredData?: unknown) => void
  warn: (code: string, structuredData?: unknown) => void
  success: (code: string, structuredData?: unknown) => void
  title: (text: string) => void
  box: (text: string, options?: Options) => void
  step: (step: number, total: number, text: string) => void
  spinner: (text: string) => {
    succeed: (text: string) => void
    fail: (text: string) => void
  }
}

export const logger = ((): Logger => {
  let runtimeState: Runtime = "mcp-server"
  let logFilePath: string | undefined = undefined

  return {
    setRuntime: (runtime) => {
      runtimeState = runtime
    },
    setLogFilePath: (path) => {
      logFilePath = path
    },
    info: (code, structuredData) => {
      if (runtimeState !== "mcp-server") {
        console.info(chalk.blue("ℹ"), chalk.blue(code), structuredData ?? "")
      } else if (logFilePath) {
        appendFileSync(
          logFilePath,
          JSON.stringify(
            {
              ...(structuredData ?? {}),
              code,
              level: "info",
            },
            null,
            2
          ) + "\n",
          {
            encoding: "utf-8",
          }
        )
      }
    },
    error: (code, structuredData) => {
      if (runtimeState !== "mcp-server") {
        console.error(chalk.red("✖"), chalk.red(code), structuredData ?? "")
      } else if (logFilePath) {
        appendFileSync(
          logFilePath,
          JSON.stringify(
            {
              ...(structuredData ?? {}),
              code,
              level: "error",
            },
            null,
            2
          ) + "\n",
          {
            encoding: "utf-8",
          }
        )
      }
    },
    warn: (code, structuredData) => {
      if (runtimeState !== "mcp-server") {
        console.warn(
          chalk.yellow("⚠"),
          chalk.yellow(code),
          structuredData ?? ""
        )
      } else if (logFilePath) {
        appendFileSync(
          logFilePath,
          JSON.stringify(
            { ...(structuredData ?? {}), code, level: "warn" },
            null,
            2
          ) + "\n",
          {
            encoding: "utf-8",
          }
        )
      }
    },
    success: (code, structuredData) => {
      if (runtimeState !== "mcp-server") {
        console.log(chalk.green("✓"), chalk.green(code), structuredData ?? "")
      } else if (logFilePath) {
        appendFileSync(
          logFilePath,
          JSON.stringify(
            { ...(structuredData ?? {}), code, level: "success" },
            null,
            2
          ) + "\n",
          {
            encoding: "utf-8",
          }
        )
      }
    },
    title: (text) => {
      if (runtimeState !== "mcp-server") {
        console.log("\n" + chalk.bold.cyan(text))
        console.log(chalk.cyan("=".repeat(text.length)) + "\n")
      }
    },
    box: (text, options = {}) => {
      if (runtimeState !== "mcp-server") {
        console.log(
          boxen(text, {
            padding: 1,
            margin: 1,
            borderStyle: "round",
            borderColor: "cyan",
            ...options,
          })
        )
      }
    },
    step: (step, total, text) => {
      if (runtimeState !== "mcp-server") {
        const progress = `[${step}/${total}]`
        console.log(chalk.cyan(progress), text)
      }
    },
    spinner: (text: string) => {
      if (runtimeState !== "mcp-server") {
        const spinner = ora(text).start()
        return {
          succeed: (text: string) => {
            spinner.succeed(text)
          },
          fail: (text: string) => {
            spinner.fail(text)
          },
        }
      } else {
        logger.info(text)
        return {
          succeed: () => {
            logger.info(text)
          },
          fail: () => {
            logger.error(text)
          },
        }
      }
    },
  }
})()
