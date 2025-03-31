/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { logger } from "../../lib/logger"

export type ProjectInfo = {
  dependencies: Record<string, string> | null
  devDependencies: Record<string, string> | null
  packageManager: string
}

export const getProjectInfo = async (
  projectDirectory: string
): Promise<ProjectInfo> => {
  const { dependencies, devDependencies, packageJson } = await readFile(
    resolve(projectDirectory, "package.json"),
    "utf-8"
  )
    .then((rawJson) => {
      const json = JSON.parse(rawJson)
      const dependencies: Record<
        "dependencies" | "devDependencies",
        Record<string, string>
      > = {
        dependencies: json.dependencies,
        devDependencies: json.devDependencies,
      }
      return {
        ...dependencies,
        packageJson: json,
      }
    })
    .catch((e) => {
      logger.warn("Failed to get package.json", e)
      return {
        dependencies: null,
        devDependencies: null,
        packageJson: null,
      }
    })

  const packageManager = (() => {
    const packageManager = packageJson?.packageManager
    if (typeof packageManager === "string") return packageManager

    const yarnLockFile = resolve(projectDirectory, "yarn.lock")
    if (existsSync(yarnLockFile)) return "yarn"

    const pnpmLockFile = resolve(projectDirectory, "pnpm-lock.yaml")
    if (existsSync(pnpmLockFile)) return "pnpm"

    const npmLockFile = resolve(projectDirectory, "package-lock.json")
    if (existsSync(npmLockFile)) return "npm"

    return "unknown"
  })()

  return {
    dependencies,
    devDependencies,
    packageManager,
  } as const
}
