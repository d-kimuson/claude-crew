import { loadConfig } from "@claude-crew/core"
import type { Config } from "@claude-crew/core"
import type { z } from "zod"
import { envUtils } from "../envUtils"

export type ToolDeclare<Input extends z.AnyZodObject> = {
  name: string
  description: string
  inputSchema: Input
  execute: (input: z.infer<Input>) => unknown
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defineTool = <Input extends z.ZodType<any, any, any>>(declare: {
  name: string
  description: string
  inputSchema: Input
  execute: (config: Config, input: z.infer<Input>) => unknown
}) => {
  const config = loadConfig(envUtils.getEnv("CONFIG_PATH"))

  return {
    ...declare,
    name: `${config.name}-${declare.name}`,
    execute: (input: z.infer<Input>) => declare.execute(config, input),
  }
}
