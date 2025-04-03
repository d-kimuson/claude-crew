import { z } from "zod"
import { editorTools } from "../../core/tools/editor"
import { defineTool } from "../utils/defineTool"
import { toErrorResponse, toResponse } from "../utils/toResponse"
import { integration } from "./interface"

export const shellIntegration = integration({
  name: "shell",
  configSchema: z
    .object({
      allowedCommands: z.array(z.string()).default(["pnpm"]),
    })
    .default({}),
}).tools((config) => {
  return [
    defineTool(({ server, ...ctx }) =>
      server.tool(
        `${ctx.config.name}-exec-bash`,
        `Execute a bash command. only ${config.allowedCommands.join(
          ", "
        )} are allowed.`,
        {
          command: z.string().describe("Command to execute"),
        },
        (input) => {
          try {
            if (
              config.allowedCommands.some((command) =>
                input.command.startsWith(command)
              )
            ) {
              return toResponse(editorTools(ctx).execBash(input.command))
            } else {
              return toErrorResponse({
                message: `Command ${input.command} is not allowed`,
                allowed: config.allowedCommands,
              })
            }
          } catch (error) {
            return toErrorResponse(error)
          }
        }
      )
    ),
  ] as const
})
