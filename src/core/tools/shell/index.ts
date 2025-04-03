import { execSync } from "node:child_process"
import { Result } from "neverthrow"
import { z } from "zod"
import type { Config } from "../../config/schema"
import type { InternalToolResult } from "../interface"
import { DiscriminatedError } from "../../errors/DiscriminatedError"
import { unhandledError } from "../../errors/unhandleError"

const execSyncErrorSchema = z.object({
  status: z.number(),
  output: z.array(z.string().or(z.null())),
  pid: z.number(),
  stdout: z.string(),
  stderr: z.string(),
})

type ExecSyncError = z.infer<typeof execSyncErrorSchema>

const execBashError = (error: ExecSyncError) =>
  new DiscriminatedError("EXEC_BASH_FAILED", "failed to execute command", {
    stdout: error.stdout === "" ? null : error.stdout,
    stderr: error.stderr === "" ? null : error.stderr,
  })

export const shellTools = (config: Config) => {
  // コマンド実行のヘルパー関数
  const execBash = Result.fromThrowable(
    (command: string) =>
      execSync(command, {
        cwd: config.directory,
        encoding: "utf-8",
      }),
    (error) => {
      if (!(error instanceof Error)) {
        throw new Error("illegal state: error is not an instance of Error")
      }

      const result = execSyncErrorSchema.safeParse(error)
      if (result.success) {
        return execBashError(result.data)
      }

      return unhandledError(error, {
        method: "execBash",
      })
    }
  )

  return {
    // インストールコマンド実行
    install: (): InternalToolResult => {
      const command = config.commands.install
      return execBash(command).match(
        (output) => ({
          success: true as const,
          command,
          stdout: output,
        }),
        (error) => ({
          success: false as const,
          command,
          error:
            error.code === "EXEC_BASH_FAILED"
              ? {
                  message: error.message,
                  ...error.details,
                }
              : error,
        })
      )
    },

    // ビルドコマンド実行
    build: (): InternalToolResult => {
      const command = config.commands.build
      return execBash(command).match(
        (output) => ({
          success: true as const,
          command,
          stdout: output,
        }),
        (error) => ({
          success: false as const,
          command,
          error:
            error.code === "EXEC_BASH_FAILED"
              ? {
                  message: error.message,
                  ...error.details,
                }
              : error,
        })
      )
    },
  }
}
