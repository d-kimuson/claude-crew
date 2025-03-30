import { appendFileSync, writeFileSync } from "node:fs"

/* eslint-disable no-console */
export type Runtime = "mcp-server" | "cli" | "debug"

export type Logger = {
  setRuntime: (runtime: Runtime) => void
  setLogFilePath: (path: string) => void
  info: (code: string, structuredData?: unknown) => void
  error: (code: string, structuredData?: unknown) => void
  warn: (code: string, structuredData?: unknown) => void
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
        console.info(code, structuredData ?? "")
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
        console.error(code, structuredData ?? "")
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
        console.warn(code, structuredData ?? "")
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
  }
})()
