import { existsSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import type { Config } from "./schema"

export const writeConfig = async (path: string, config: Config) => {
  const dir = dirname(path)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
  await writeFile(
    path,
    JSON.stringify(
      {
        $schema:
          "https://raw.githubusercontent.com/d-kimuson/claude-crew/refs/heads/main/config-schema.json",
        ...config,
      },
      null,
      2
    )
  )
}
