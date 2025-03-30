import { execSync } from "node:child_process"
import { resolve } from "node:path"
import type { Config } from "./schema"

export const mcpConfig = (config: Config) => ({
  [`claude-crew-${config.name}`]: {
    command: execSync("which npx", { encoding: "utf-8" }).trim(),
    args: [
      "-y",
      "claude-crew@latest",
      "serve-mcp",
      resolve(config.directory, ".claude-crew", "config.json"),
    ],
  },
})
