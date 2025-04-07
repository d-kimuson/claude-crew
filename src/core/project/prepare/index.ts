import { execSync } from "node:child_process"
import { logger } from "../../../lib/logger"
import { isIntegrationEnabled } from "../../../mcp-server/integrations/isIntegrationEnabled"
import { withContext } from "../../context/withContext"
import { findRelevantDocuments } from "../../embedding/findRelevantDocuments"
import { findRelevantResources } from "../../embedding/findRelevantResources"
import { formatRagContents } from "../../embedding/formatRagContents"
import { indexCodebase } from "../../embedding/indexCodebase"
import { getProjectInfo } from "../getProjectInfo"
import { checkAndPullLatestChanges } from "./pullLatest"

export const prepareTask = withContext(
  (ctx) => async (args?: { documentQuery: string; resourceQuery: string }) => {
    // ブランチの最新化を試みる
    checkAndPullLatestChanges(ctx)

    execSync(ctx.config.commands.install, {
      cwd: ctx.config.directory,
      encoding: "utf-8",
    })

    // Get project info
    const projectInfo = await getProjectInfo(ctx.config.directory)

    // Only index the codebase if embedding is enabled
    if (args === undefined || !isIntegrationEnabled(ctx)("rag")) {
      logger.info("⚠️ Embedding is disabled, skipping codebase indexing")
      return {
        success: true,
        projectInfo,
      } as const
    }

    await indexCodebase(ctx)
    logger.info("✅ index codebase done")

    // Get relevant documents and resources only if embedding is enabled
    const [relevantDocuments, relevantResources] = await Promise.all([
      findRelevantDocuments(ctx)(args.documentQuery).then(formatRagContents),
      findRelevantResources(ctx)(args.resourceQuery).then(formatRagContents),
    ])

    return {
      success: true,
      relevantDocuments,
      relevantResources,
      projectInfo,
    } as const
  }
)
