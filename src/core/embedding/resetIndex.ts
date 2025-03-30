import { logger } from "../../lib/logger"
import { withContext } from "../context/withContext"

export const resetIndex = withContext(
  (ctx) => async (projectDirectory: string) => {
    const project = await ctx.queries.projects.getByDirectory.execute({
      directory: projectDirectory,
    })
    if (project === undefined) {
      return
    }

    const resources = await ctx.queries.resources.getByProject.execute({
      projectId: project.id,
    })
    const documents = await ctx.queries.documents.getByProject.execute({
      projectId: project.id,
    })

    await ctx.queries.embeddings.deleteByResources.execute({
      resourceIds: resources.map((r) => r.id),
    })
    await ctx.queries.documentEmbeddings.deleteByDocuments.execute({
      documentIds: documents.map((d) => d.id),
    })

    await ctx.queries.resources.deleteByProject.execute({
      projectId: project.id,
    })
    await ctx.queries.documents.deleteByProject.execute({
      projectId: project.id,
    })

    logger.info(`Index for ${projectDirectory} is successfully deleted.`)
  }
)
