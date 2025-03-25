import { DiscriminatedError } from "./DiscriminatedError"

export const noSuchFileOrDirectoryError = (options?: {
  filePath?: string
  cause?: Error
}) =>
  new DiscriminatedError(
    "NoSuchFileOrDirectory",
    options?.filePath
      ? `No such file or directory: ${options.filePath}`
      : "No such file or directory",
    {
      filePath: options?.filePath,
    },
    options?.cause
  )
