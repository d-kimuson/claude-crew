import { execSync } from "node:child_process"
import { resolve } from "node:path"
import { withConfig } from "../utils/withConfig"

export const mcpConfig = withConfig((config) => {
  return {
    [`claude-crew-${config.name}`]: {
      command: execSync("which npx", { encoding: "utf-8" }).trim(),
      args: ["-y", "claude-crew"],
      env: {
        CONFIG_PATH: resolve(config.directory, ".claude-crew", "config.json"),
      },
    },
  }
})
