import type { Context } from "../../core/context/interface"
import type { ToolDeclare } from "../utils/defineTool"
import type { z } from "zod"
import { withContext } from "../../core/context/withContext"

export type IntegrationConfig = {
  name: string
  configSchema: z.ZodSchema
}

export const integration = <const T extends IntegrationConfig>(
  integrationConfig: T
) => {
  return {
    tools: (cb: (config: z.infer<T["configSchema"]>) => ToolDeclare[]) => {
      const registerFn = withContext((ctx): ToolDeclare[] => {
        const found = ctx.config.integrations.find(
          (c) => c.name === integrationConfig.name
        )

        if (!found) {
          // do nothing
          return []
        }

        const tools = cb(found.config)
        return tools
      })

      return {
        config: integrationConfig,
        register: registerFn,
      } as const
    },
  }
}
