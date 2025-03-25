import type { z } from "zod"

export type ToolDeclare<Input extends z.ZodTypeAny> = {
  name: string
  description: string
  inputSchema: Input
  execute: (input: z.infer<Input>) => unknown
}

export const defineTool = <Input extends z.ZodTypeAny>(
  declare: ToolDeclare<Input>
) => {
  return declare
}
