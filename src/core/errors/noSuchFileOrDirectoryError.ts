import { DiscriminatedError } from "./DiscriminatedError"

export const noSuchFileOrDirectoryError = (options?: {
  filePath?: string
  cause?: Error
}) =>
  new DiscriminatedError(
    "NO_SUCH_FILE_OR_DIRECTORY",
    options?.filePath
      ? `No such file or directory: ${options.filePath}`
      : "No such file or directory",
    {
      filePath: options?.filePath,
    },
    options?.cause
  )
