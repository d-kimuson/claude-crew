import { existsSync } from "node:fs"
import type { InternalToolResult } from "../interface"
import { withContext } from "../../context/withContext"
import { execBash } from "./bash"
import { toAbsolutePath } from "./toAbsolutePath"

export const checkModifiedFiles = withContext((ctx) => (files: string[]) => {
  const absolutePaths = files.map(toAbsolutePath(ctx))
  const outputs = ctx.config.commands.checkFiles
    .map((commandTemplate) =>
      commandTemplate.replace("<files>", absolutePaths.join(" "))
    )
    .map((command) =>
      execBash(ctx)(command).match(
        (stdout): InternalToolResult =>
          ({
            success: true,
            command,
            stdout,
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
    )

  return outputs
})

const FILE_EXTENSIONS = [
  ".ts",
  ".mts",
  ".cts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]

const TEST_MIDDLE_EXTENSIONS = [".test", ".spec"]

export const testModifiedFiles = withContext((ctx) => (files: string[]) => {
  const outputs = files.map((file) => {
    const absolutePath = toAbsolutePath(ctx)(file)
    const extension = FILE_EXTENSIONS.find((ext) => absolutePath.endsWith(ext))

    if (extension === undefined)
      return {
        success: true,
        file: absolutePath,
        supplement: "No test file exists.",
      } as const

    const testFilePathCandidates = [
      ...TEST_MIDDLE_EXTENSIONS.flatMap((middleExt) =>
        FILE_EXTENSIONS.map((ext) =>
          absolutePath.replace(extension, `${middleExt}${ext}`)
        )
      ),
      ...(TEST_MIDDLE_EXTENSIONS.some((middleExt) =>
        absolutePath.endsWith(middleExt + extension)
      )
        ? [absolutePath]
        : []),
    ]

    const testFilePath = testFilePathCandidates.find((path) => existsSync(path))

    if (testFilePath === undefined) {
      return {
        success: true,
        file: absolutePath,
        supplement: "No test file exists.",
      } as const
    }
    const result = execBash(ctx)(
      ctx.config.commands.testFile.replace("<file>", testFilePath)
    )

    if (result.isOk()) {
      return {
        success: true,
        file: absolutePath,
        testFile: testFilePath,
        supplement: `All tests for ${absolutePath} passed.`,
      } as const
    }

    return {
      success: false,
      file: absolutePath,
      testFile: testFilePath,
      error:
        result.error.code === "EXEC_BASH_FAILED"
          ? {
              message: result.error.message,
              ...result.error.details,
            }
          : result.error,
    } as const
  })

  return outputs
})
