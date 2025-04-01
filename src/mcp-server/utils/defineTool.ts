import type { Context } from "../../core/context/interface"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

export type ToolDeclare = (
  ctx: Context & {
    server: McpServer
  }
) => void | Promise<void>

export const defineTool = (cb: ToolDeclare) => cb
