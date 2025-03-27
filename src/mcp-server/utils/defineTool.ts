import type { Config } from "../../core/config/schema"
import type { z } from "zod"

export const defineTool =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <Input extends z.ZodType<any, any, any>>(declare: {
      name: string
      description: string
      inputSchema: Input
      execute: (
        ctx: {
          config: Config
          configPath: string
        },
        input: z.infer<Input>
      ) => unknown
    }) =>
    (ctx: { config: Config; configPath: string }) => {
      return {
        ...declare,
        name: `${ctx.config.name}-${declare.name}`,
        execute: (input: z.infer<Input>) => declare.execute(ctx, input),
      }
    }
