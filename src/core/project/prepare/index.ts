import { execSync } from "child_process"
import { logger } from "../../../lib/logger"
import { withContext } from "../../context/withContext"
import { findRelevantDocuments } from "../../embedding/findRelevantDocuments"
import { findRelevantResources } from "../../embedding/findRelevantResources"
import { formatRagContents } from "../../embedding/formatRagContents"
import { indexCodebase } from "../../embedding/indexCodebase"
import { getProjectInfo } from "../getProjectInfo"

export const prepareTask = withContext(
  (ctx) => async (documentQuery: string, resourceQuery: string) => {
    await indexCodebase(ctx)
    logger.info("✅ index codebase done")

    execSync(ctx.config.commands.install, {
      cwd: ctx.config.directory,
      encoding: "utf-8",
    })

    const [projectInfo, relevantDocuments, relevantResources] =
      await Promise.all([
        getProjectInfo(ctx.config.directory),
        findRelevantDocuments(ctx)(documentQuery).then(formatRagContents),
        findRelevantResources(ctx)(resourceQuery).then(formatRagContents),
      ])

    return {
      success: true,
      relevantDocuments,
      relevantResources,
      projectInfo,
    } as const
  }
)
