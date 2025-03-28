import type { Config } from "../../core/config/schema"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

export const defineTool = <T>(
  cb: (ctx: { server: McpServer; config: Config; configPath: string }) => T
) => cb
