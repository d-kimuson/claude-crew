import { execSync } from "child_process"
import type { Context } from "../../context/interface"
import { logger } from "../../../lib/logger"

/**
 * Get the current branch name
 * @param projectDirectory Project directory path
 * @returns Current branch name
 */
export const getCurrentBranch = (projectDirectory: string): string => {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: projectDirectory,
      encoding: "utf-8",
    }).trim()
  } catch {
    logger.warn("Failed to get current branch name")
    return ""
  }
}

/**
 * Check if there are uncommitted changes in the local repository
 * @param projectDirectory Project directory path
 * @returns true if there are changes, false otherwise
 */
export const hasUncommittedChanges = (projectDirectory: string): boolean => {
  try {
    const status = execSync("git status --porcelain", {
      cwd: projectDirectory,
      encoding: "utf-8",
    })
    return status.trim() !== ""
  } catch {
    logger.warn("Failed to check uncommitted changes")
    return true // Return true for safety in case of error
  }
}

/**
 * Fetch and pull the latest changes from the remote repository
 * @param ctx Context
 * @returns true if update was successful, false otherwise
 */
export const checkAndPullLatestChanges = (ctx: Context): boolean => {
  const { config } = ctx
  const { directory } = config

  // Do nothing if git config is missing or autoPull is disabled
  if (!config.git?.autoPull) {
    return false
  }

  const defaultBranch = config.git?.defaultBranch ?? "main"
  const currentBranch = getCurrentBranch(directory)

  // Do nothing if current branch cannot be determined
  if (!currentBranch) {
    logger.warn("Could not determine current branch")
    return false
  }

  // Do nothing if not on default branch
  if (currentBranch !== defaultBranch) {
    logger.info(
      `Current branch is ${currentBranch}, not on default branch ${defaultBranch}`
    )
    return false
  }

  // Do nothing if there are uncommitted local changes
  if (hasUncommittedChanges(directory)) {
    logger.info("Uncommitted changes detected, skipping auto-pull")
    return false
  }

  try {
    logger.info(`Pulling latest changes from origin/${defaultBranch}...`)
    execSync(`git pull --rebase origin ${defaultBranch}`, {
      cwd: directory,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"], // Capture stdout and stderr
    })

    logger.info("Successfully pulled latest changes")
    return true
  } catch {
    logger.warn("Failed to pull latest changes")
    return false
  }
}
