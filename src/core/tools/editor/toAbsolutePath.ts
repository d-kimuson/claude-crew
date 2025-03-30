import { resolve } from "node:path"
import { withContext } from "../../context/withContext"

export const toAbsolutePath = withContext((ctx) => (filePath: string) => {
  if (filePath.startsWith("/")) {
    return filePath
  }

  return resolve(ctx.config.directory, filePath)
})
