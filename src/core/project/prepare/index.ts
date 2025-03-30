import { execSync } from "child_process"
import { logger } from "../../../lib/logger"
import { withContext } from "../../context/withContext"
import { findRelevantDocuments } from "../../embedding/findRelevantDocuments"
import { findRelevantResources } from "../../embedding/findRelevantResources"
import { formatRagContents } from "../../embedding/formatRagContents"
import { indexCodebase } from "../../embedding/indexCodebase"
import { getProjectInfo } from "../getProjectInfo"

export const prepareTask = withContext(
  (ctx) =>
    async (branch: string, documentQuery: string, resourceQuery: string) => {
      if (
        execSync("git status -s", {
          cwd: ctx.config.directory,
          encoding: "utf-8",
        })
          .split("\n")
          .filter((line) => line.trim() !== "").length === 0
      ) {
        execSync(
          `git switch ${ctx.config.git.defaultBranch} && git pull --rebase origin ${ctx.config.git.defaultBranch}`,
          {
            cwd: ctx.config.directory,
            encoding: "utf-8",
          }
        )

        execSync(`git switch -c ${ctx.config.git.branchPrefix}${branch}`, {
          cwd: ctx.config.directory,
          encoding: "utf-8",
        })
      }

      await indexCodebase(ctx)
      logger.info("✅ index codebase done")

      const projectInfo = await getProjectInfo(ctx.config.directory)
      const relevantDocuments =
        await findRelevantDocuments(ctx)(documentQuery).then(formatRagContents)
      const relevantResources =
        await findRelevantResources(ctx)(resourceQuery).then(formatRagContents)

      return {
        success: true,
        relevantDocuments,
        relevantResources,
        projectInfo,
      } as const
    }
)
