import { eq, inArray } from "drizzle-orm"
import { logger } from "../../lib/logger"
import { withContext } from "../context/withContext"
import { embeddingsTable } from "../lib/drizzle/schema/embeddings"
import { projectsTable } from "../lib/drizzle/schema/projects"
import { resourcesTable } from "../lib/drizzle/schema/resources"

export const resetIndex = withContext(
  (ctx) => async (projectDirectory: string) => {
    const [project] = await ctx.db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.name, projectDirectory))
      .limit(1)
    if (project === undefined) {
      return
    }

    const resources = await ctx.db
      .select()
      .from(resourcesTable)
      .where(eq(resourcesTable.projectId, project.id))

    await ctx.db.delete(embeddingsTable).where(
      inArray(
        embeddingsTable.resourceId,
        resources.map((r) => r.id)
      )
    )
    await ctx.db
      .delete(resourcesTable)
      .where(eq(resourcesTable.projectId, project.id))

    logger.info(`Index for ${projectDirectory} is successfully deleted.`)
  }
)
