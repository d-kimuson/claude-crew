import { existsSync } from "fs"
import { writeFile, readFile } from "fs/promises"
import { mkdir, readdir, stat } from "node:fs/promises"
import { dirname, join } from "node:path"
import { glob } from "glob"
import type { InternalToolResult } from "../interface"
import { withContext } from "../../context/withContext"
import { textDiff } from "../../utils/textDiff"
import { execBash } from "./bash"
import { checkModifiedFiles, testModifiedFiles } from "./checks"
import { toAbsolutePath } from "./toAbsolutePath"

export const editorTools = withContext((ctx) => {
  return {
    execBash: (command: string) => {
      return execBash(ctx)(command).match(
        (output): InternalToolResult =>
          ({
            success: true,
            command,
            stdout: output,
          }) as const,
        (error): InternalToolResult =>
          ({
            success: false,
            meta: {
              command,
            },
            error:
              error.code === "EXEC_BASH_FAILED"
                ? {
                    message: error.message,
                    ...error.details,
                  }
                : error,
          }) as const
      )
    },

    readFile: async (
      filePath: string,
      maxLine = 100,
      offset = 0
    ): Promise<InternalToolResult> => {
      try {
        const absolutePath = toAbsolutePath(ctx)(filePath)
        if (!existsSync(absolutePath)) {
          return {
            success: false,
            meta: {
              filePath,
            },
            error: {
              reason: "No such file or directory",
            },
          } as const
        }

        const content = await readFile(absolutePath, { encoding: "utf-8" })
        const lines = content.split("\n")

        const totalLines = lines.length
        const endOffset = Math.min(offset + maxLine, totalLines)

        const slicedContent = lines.slice(offset, endOffset).join("\n")

        return {
          success: true,
          content: slicedContent,
          nextOffset: endOffset === totalLines ? null : endOffset + 1,
        } as const
      } catch (error: unknown) {
        return {
          success: false,
          meta: {
            filePath,
          },
          error: {
            reason: "unknown",
            cause: error,
          },
        } as const
      }
    },

    mkdir: async (filePath: string): Promise<InternalToolResult> => {
      try {
        const absolutePath = toAbsolutePath(ctx)(filePath)
        await mkdir(dirname(absolutePath), {
          recursive: true,
        })

        return {
          success: true,
        } as const
      } catch (error: unknown) {
        return {
          success: false,
          error,
        } as const
      }
    },

    writeFile: async (
      filePath: string,
      content: string
    ): Promise<InternalToolResult> => {
      try {
        const absolutePath = toAbsolutePath(ctx)(filePath)
        if (!existsSync(absolutePath)) {
          await mkdir(dirname(absolutePath), {
            recursive: true,
          })
        }

        await writeFile(toAbsolutePath(ctx)(filePath), content, {
          encoding: "utf-8",
        })

        return {
          success: true,
          checkResults: [
            ...checkModifiedFiles(ctx)([filePath]),
            ...testModifiedFiles(ctx)([filePath]),
          ],
        } as const
      } catch (error: unknown) {
        return {
          success: false,
          error,
        }
      }
    },

    replaceFile: async (
      filePath: string,
      pattern: string,
      replace: string
    ): Promise<InternalToolResult> => {
      try {
        const absolutePath = toAbsolutePath(ctx)(filePath)
        if (!existsSync(absolutePath)) {
          return {
            success: false,
            error: {
              reason: "No such file or directory",
              filePath,
            },
          } as const
        }

        const content = await readFile(absolutePath, { encoding: "utf-8" })
        const newContent = content.replace(new RegExp(pattern), replace)

        await writeFile(absolutePath, newContent, { encoding: "utf-8" })

        const diffs = textDiff(content, newContent)

        return {
          success: true,
          changes: diffs,
          checkResults: [
            ...checkModifiedFiles(ctx)([filePath]),
            ...testModifiedFiles(ctx)([filePath]),
          ],
        } as const
      } catch (error: unknown) {
        return {
          success: false,
          error: {
            reason: "unknown",
            cause: error,
          },
        }
      }
    },

    listDirectory: async (
      path: string,
      depth: number
    ): Promise<InternalToolResult> => {
      try {
        const absolutePath = toAbsolutePath(ctx)(path)
        if (!existsSync(absolutePath)) {
          return {
            success: false,
            meta: {
              path,
            },
            error: {
              reason: "No such file or directory",
            },
          } as const
        }

        const statInfo = await stat(absolutePath)
        if (!statInfo.isDirectory()) {
          return {
            success: false,
            meta: {
              path,
            },
            error: {
              reason: "Not a directory",
            },
          } as const
        }

        const entries = await readdir(absolutePath)
        const result: string[] = []

        for (const entry of entries) {
          const entryPath = join(absolutePath, entry)
          const entryStat = await stat(entryPath)

          if (entryStat.isDirectory()) {
            result.push(`[DIR] ${entry}`)

            // 再帰呼び出しが必要で、深さが1より大きい場合
            if (depth > 1) {
              // ここでは直接再帰呼び出しを行わず、再帰処理関数を定義
              const processSubDirectory = async (
                subPath: string,
                currentDepth: number
              ) => {
                const subEntries = await readdir(join(absolutePath, subPath))
                const subResults: string[] = []

                for (const subEntry of subEntries) {
                  const subEntryPath = join(absolutePath, subPath, subEntry)
                  const subEntryStat = await stat(subEntryPath)

                  const indent = "  ".repeat(currentDepth)

                  if (subEntryStat.isDirectory()) {
                    subResults.push(`${indent}[DIR] ${subEntry}`)

                    if (currentDepth < depth - 1) {
                      const deeperResults = await processSubDirectory(
                        join(subPath, subEntry),
                        currentDepth + 1
                      )
                      subResults.push(...deeperResults)
                    }
                  } else {
                    subResults.push(`${indent}[FILE] ${subEntry}`)
                  }
                }

                return subResults
              }

              // サブディレクトリの処理を開始
              const subResults = await processSubDirectory(entry, 1)
              result.push(...subResults)
            }
          } else {
            result.push(`[FILE] ${entry}`)
          }
        }

        return {
          success: true,
          entries: result,
        } as const
      } catch (error: unknown) {
        return {
          success: false,
          meta: {
            path,
          },
          error: {
            reason: "unknown",
            cause: error,
          },
        } as const
      }
    },

    glob: async (
      pattern: string,
      cwd?: string
    ): Promise<InternalToolResult> => {
      try {
        const result = await glob(pattern, {
          cwd:
            cwd !== undefined ? toAbsolutePath(ctx)(cwd) : ctx.config.directory,
        })
        return {
          success: true,
          matches: result,
        } as const
      } catch (error: unknown) {
        return {
          success: false,
          error,
        } as const
      }
    },

    grep: async (
      pattern: string,
      options?: {
        filePattern?: string
        cwd?: string
      }
    ): Promise<InternalToolResult> => {
      try {
        const { cwd = ctx.config.directory, filePattern = "**/*" } =
          options ?? {}
        const files = await glob(filePattern, {
          cwd: toAbsolutePath(ctx)(cwd),
        })

        const regex = new RegExp(pattern)
        const results = await Promise.all(
          files
            .map((file) => toAbsolutePath(ctx)(file))
            .map(async (absolutePath) => {
              const content = await readFile(absolutePath, {
                encoding: "utf-8",
              })
              const lines = content.split("\n")

              const matchedLines = lines.flatMap((line, index) =>
                regex.test(line)
                  ? [
                      {
                        file: absolutePath,
                        line: index + 1,
                        content: line,
                      } as const,
                    ]
                  : []
              )

              return matchedLines
            })
        ).then((arr) => arr.flat())

        return {
          success: true,
          matches: results,
          count: results.length,
        }
      } catch (error: unknown) {
        return {
          success: false,
          error: {
            reason: "unknown",
            cause: error,
          },
        } as const
      }
    },

    testFile: (filePath: string): InternalToolResult => {
      const absolutePath = toAbsolutePath(ctx)(filePath)
      if (!existsSync(absolutePath)) {
        return {
          success: false,
          error: { reason: "No such file or directory", filePath },
        } as const
      }

      const command = ctx.config.commands.testFile.replace(
        "<file>",
        absolutePath
      )

      return execBash(ctx)(command).match(
        (output): InternalToolResult =>
          ({
            success: true,
            command,
            stdout: output,
          }) as const,
        (error): InternalToolResult =>
          ({
            success: false,
            meta: {
              command,
            },
            error,
          }) as const
      )
    },

    checkAll: async (): Promise<InternalToolResult> => {
      const checkResults = await Promise.all(
        [...ctx.config.commands.checks, ctx.config.commands.test].map(
          (command) => {
            return execBash(ctx)(command).match(
              (output) =>
                ({
                  success: true,
                  command,
                  stdout: output,
                }) as const,
              (error) =>
                ({
                  success: false,
                  command,
                  error:
                    error.code === "EXEC_BASH_FAILED"
                      ? {
                          message: error.message,
                          ...error.details,
                        }
                      : error,
                }) as const
            )
          }
        )
      )

      return {
        success: true,
        checkResults,
      } as const
    },
  }
})
