import { execSync } from "child_process"
import { findRelevantDocuments } from "../../embedding/findRelevantDocuments"
import { findRelevantResources } from "../../embedding/findRelevantResources"
import { indexCodebase } from "../../embedding/indexCodebase"
import { runMigrate } from "../../lib/drizzle/runMigrate"
import { withDb } from "../../lib/drizzle/withDb"
import { withConfig } from "../../utils/withConfig"

export const prepareTask = withConfig((config) =>
  withDb((ctx) => async (branch: string, query: string) => {
    if (
      execSync("git status -s", {
        cwd: config.directory,
        encoding: "utf-8",
      }).length !== 0
    ) {
      return {
        success: false,
        error: "Remaining uncommitted changes in the project",
      } as const
    }

    execSync(
      `git switch ${config.git.defaultBranch} && git pull --rebase origin ${config.git.defaultBranch}`,
      {
        cwd: config.directory,
        encoding: "utf-8",
      }
    )

    execSync(`git switch -c ${config.git.branchPrefix}${branch}`, {
      cwd: config.directory,
      encoding: "utf-8",
    })

    await runMigrate(ctx.databaseUrl)
    console.log("✅ migrate done")
    await indexCodebase(ctx)(config.directory)
    console.log("✅ index codebase done")

    const relevantDocuments = await findRelevantDocuments(ctx)(query)
    const relevantResources = await findRelevantResources(ctx)(query)

    return {
      success: true,
      relevantDocuments,
      relevantResources,
    } as const
  })
)
