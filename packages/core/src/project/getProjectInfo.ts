/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

export const getProjectInfo = async (projectDirectory: string) => {
  const { dependencyText, packageJson } = await readFile(
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
        dependencyText: JSON.stringify(dependencies),
        packageJson: json,
      }
    })
    .catch((e) => {
      console.warn(e)
      return {
        dependencyText: "Failed to get package.json",
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
    dependencyText,
    packageManager,
  } as const
}
