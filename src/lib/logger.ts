/* eslint-disable no-console */
export type Runtime = "mcp-server" | "cli" | "debug"

export type Logger = {
  setRuntime: (runtime: Runtime) => void
  info: (code: string, structuredData?: unknown) => void
  error: (code: string, structuredData?: unknown) => void
  warn: (code: string, structuredData?: unknown) => void
}

export const logger = ((): Logger => {
  let runtimeState: Runtime = "mcp-server"

  return {
    setRuntime: (runtime) => {
      runtimeState = runtime
    },
    info: (code, structuredData) => {
      if (runtimeState !== "mcp-server") {
        console.info(code, structuredData ?? "")
      }
    },
    error: (code, structuredData) => {
      if (runtimeState !== "mcp-server") {
        console.error(code, structuredData ?? "")
      }
    },
    warn: (code, structuredData) => {
      if (runtimeState !== "mcp-server") {
        console.warn(code, structuredData ?? "")
      }
    },
  }
})()
