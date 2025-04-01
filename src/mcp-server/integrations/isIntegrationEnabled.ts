import type { IntegrationNames } from "."
import { withContext } from "../../core/context/withContext"

export const isIntegrationEnabled = withContext(
  (ctx) => (name: IntegrationNames) => {
    return ctx.config.integrations.find((c) => c.name === name) !== undefined
  }
)
