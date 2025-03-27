import { execSync } from "child_process"
import { findRelevantDocuments } from "../../embedding/findRelevantDocuments"
import { findRelevantResources } from "../../embedding/findRelevantResources"
import { formatRagContents } from "../../embedding/formatRagContents"
import { indexCodebase } from "../../embedding/indexCodebase"
import { runMigrate } from "../../lib/drizzle/runMigrate"
import { withDb } from "../../lib/drizzle/withDb"
import { withConfig } from "../../utils/withConfig"
import { getProjectInfo } from "../getProjectInfo"

export const prepareTask = withConfig((config) =>
  withDb(
    (ctx) =>
      async (branch: string, documentQuery: string, resourceQuery: string) => {
        if (
          execSync("git status -s", {
            cwd: config.directory,
            encoding: "utf-8",
          }).length === 0
        ) {
          // skip pull
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
        }

        await runMigrate(ctx.databaseUrl)
        console.log("✅ migrate done")
        await indexCodebase(config)(ctx)(config.directory)
        console.log("✅ index codebase done")

        const projectInfo = await getProjectInfo(config.directory)
        const relevantDocuments =
          await findRelevantDocuments(config)(ctx)(documentQuery).then(
            formatRagContents
          )
        const relevantResources =
          await findRelevantResources(config)(ctx)(resourceQuery).then(
            formatRagContents
          )

        return {
          success: true,
          relevantDocuments,
          relevantResources,
          projectInfo,
        } as const
      }
  )
)
