import { existsSync } from "fs"
import { writeFile, readFile } from "fs/promises"
import { mkdir } from "node:fs/promises"
import { dirname } from "node:path"
import { glob } from "glob"
import { textDiff } from "../../utils/textDiff"
import { withConfig } from "../../utils/withConfig"
import { execBash } from "./bash"
import { checkModifiedFiles, testModifiedFiles } from "./checks"
import { toAbsolutePath } from "./toAbsolutePath"

export const editorTools = withConfig((config) => {
  return {
    execBash: (command: string) => {
      return execBash(config)(command).match(
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
    },

    readFile: async (filePath: string, maxLine = 100, offset = 0) => {
      try {
        const absolutePath = toAbsolutePath(config)(filePath)
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
          error: {
            reason: "unknown",
            cause: error,
          },
        } as const
      }
    },

    mkdir: async (filePath: string) => {
      const absolutePath = toAbsolutePath(config)(filePath)
      await mkdir(dirname(absolutePath), {
        recursive: true,
      })
    },

    writeFile: async (filePath: string, content: string) => {
      try {
        const absolutePath = toAbsolutePath(config)(filePath)
        if (!existsSync(absolutePath)) {
          await mkdir(dirname(absolutePath), {
            recursive: true,
          })
        }

        await writeFile(toAbsolutePath(config)(filePath), content, {
          encoding: "utf-8",
        })

        return {
          success: true,
          checkResults: [
            ...checkModifiedFiles(config)([filePath]),
            ...testModifiedFiles(config)([filePath]),
          ],
        } as const
      } catch (error: unknown) {
        return {
          success: false,
          error,
        }
      }
    },

    replaceFile: async (filePath: string, pattern: string, replace: string) => {
      try {
        const absolutePath = toAbsolutePath(config)(filePath)
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
            ...checkModifiedFiles(config)([filePath]),
            ...testModifiedFiles(config)([filePath]),
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

    glob: async (pattern: string, cwd?: string) => {
      try {
        const result = await glob(pattern, {
          cwd:
            cwd !== undefined ? toAbsolutePath(config)(cwd) : config.directory,
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
        cwd?: string
        filePattern?: string
      }
    ) => {
      try {
        const { cwd = config.directory, filePattern = "**/*" } = options ?? {}
        const files = await glob(filePattern, {
          cwd: toAbsolutePath(config)(cwd),
        })

        const regex = new RegExp(pattern)
        const results = await Promise.all(
          files
            .map((file) => toAbsolutePath(config)(file))
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

    testFile: (filePath: string) => {
      const absolutePath = toAbsolutePath(config)(filePath)
      if (!existsSync(absolutePath)) {
        return {
          success: false,
          error: { reason: "No such file or directory", filePath },
        } as const
      }

      return execBash(config)(
        config.commands.testFile.replace("<file>", absolutePath)
      )
    },
    checkAll: async () => {
      const checkResults = await Promise.all(
        [...config.commands.checks, config.commands.test].map((command) => {
          return execBash(config)(command).match(
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
        })
      )

      return {
        checkResults,
      }
    },
  }
})
