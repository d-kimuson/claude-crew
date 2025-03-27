import { execSync } from "node:child_process"
import { Result } from "neverthrow"
import { z } from "zod"
import type { Config } from "../../config/schema"
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

  // 許可されたコマンドかどうかチェック
  const isAllowedCommand = (command: string): boolean => {
    if (!config.shell.enable) {
      return false
    }

    // 許可されたコマンドプレフィックスかチェック
    return config.shell.allowedCommands.some((allowedCommand) =>
      command.trim().startsWith(allowedCommand)
    )
  }

  return {
    // 任意のコマンド実行（許可チェック付き）
    bash: (command: string) => {
      if (!isAllowedCommand(command)) {
        return {
          success: false as const,
          error: new DiscriminatedError(
            "COMMAND_NOT_ALLOWED",
            `Command '${command}' is not allowed. Allowed commands: ${config.shell.allowedCommands.join(", ")}`,
            { command }
          ),
        }
      }

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

    // プロジェクト全体のチェック実行
    checkAll: async () => {
      const checkResults = await Promise.all(
        config.commands.checks.map(async (command) => {
          const result = await Promise.resolve(execBash(command))
          return result.match(
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
        })
      )

      const testCommand = config.commands.test
      const testResult = execBash(testCommand).match(
        (output) => ({
          success: true as const,
          command: testCommand,
          stdout: output,
        }),
        (error) => ({
          success: false as const,
          command: testCommand,
          error:
            error.code === "EXEC_BASH_FAILED"
              ? {
                  message: error.message,
                  ...error.details,
                }
              : error,
        })
      )

      return {
        checks: checkResults,
        test: testResult,
      }
    },

    // インストールコマンド実行
    install: () => {
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
    build: () => {
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
