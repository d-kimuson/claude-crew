import { eq, inArray } from "drizzle-orm"
import { embeddingsTable } from "../lib/drizzle/schema/embeddings"
import { projectsTable } from "../lib/drizzle/schema/projects"
import { resourcesTable } from "../lib/drizzle/schema/resources"
import { withDb } from "../lib/drizzle/withDb"

export const resetIndex = withDb(
  ({ db }) =>
    async (projectDirectory: string) => {
      const [project] = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.name, projectDirectory))
        .limit(1)
      if (project === undefined) {
        return
      }

      const resources = await db
        .select()
        .from(resourcesTable)
        .where(eq(resourcesTable.projectId, project.id))

      await db.delete(embeddingsTable).where(
        inArray(
          embeddingsTable.resourceId,
          resources.map((r) => r.id)
        )
      )
      await db
        .delete(resourcesTable)
        .where(eq(resourcesTable.projectId, project.id))

      console.log(`Index for ${projectDirectory} is successfully deleted.`)
    }
)
