import { resolve } from "node:path"
import { withConfig } from "../../utils/withConfig"

export const toAbsolutePath = withConfig((config) => (filePath: string) => {
  if (filePath.startsWith("/")) {
    return filePath
  }

  return resolve(config.directory, filePath)
})
