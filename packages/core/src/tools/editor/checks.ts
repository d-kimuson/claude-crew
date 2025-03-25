import { existsSync } from "node:fs"
import { withConfig } from "../../utils/withConfig"
import { execBash } from "./bash"
import { toAbsolutePath } from "./toAbsolutePath"

export const checkModifiedFiles = withConfig((config) => (files: string[]) => {
  const absolutePaths = files.map(toAbsolutePath(config))
  const outputs = config.commands.checkFiles
    .map((commandTemplate) =>
      commandTemplate.replace("<files>", absolutePaths.join(" "))
    )
    .map((command) =>
      execBash(config)(command)
        .map((output) => ({
          command: command,
          stdout: output,
        }))
        .match(
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
              error: error.code === "EXEC_BASH_FAILED" ? error.data : error,
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

export const testModifiedFiles = withConfig((config) => (files: string[]) => {
  const outputs = files.map((file) => {
    const absolutePath = toAbsolutePath(config)(file)
    const extension = FILE_EXTENSIONS.find((ext) => absolutePath.endsWith(ext))

    if (extension === undefined)
      return {
        file: absolutePath,
        hasError: false,
        supplement: "No test file exists.",
      } as const

    const testFilePathCandidates = TEST_MIDDLE_EXTENSIONS.flatMap((middleExt) =>
      FILE_EXTENSIONS.map((ext) =>
        absolutePath.replace(extension, `${middleExt}${ext}`)
      )
    )

    const testFilePath = testFilePathCandidates.find((path) => existsSync(path))

    if (testFilePath === undefined) {
      return {
        file: absolutePath,
        hasError: false,
        supplement: "No test file exists.",
      } as const
    }
    const result = execBash(config)(
      config.commands.testFile.replace("<file>", testFilePath)
    )

    if (result.isOk()) {
      return {
        file: absolutePath,
        testFile: testFilePath,
        hasError: false,
        supplement: `All tests for ${absolutePath} passed.`,
      } as const
    }

    return {
      file: absolutePath,
      testFile: testFilePath,
      hasError: true,
      error:
        result.error.code === "EXEC_BASH_FAILED"
          ? result.error.data
          : result.error,
    } as const
  })

  return outputs
})
