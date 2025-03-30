import type { Context } from "../../core/context/interface"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

export const defineTool = <T>(
  cb: (
    ctx: Context & {
      server: McpServer
    }
  ) => T
) => cb
