import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { version } from "../../package.json"
import { withContext } from "../core/context/withContext"
import { editorTools } from "./tools/editor"
import { prepareTool } from "./tools/prepare"
import { ragTools } from "./tools/rag"
import { think } from "./tools/think"
import { typescriptTools } from "./tools/typescript"

const tools = [
  prepareTool,
  think,
  ...editorTools,
  ...ragTools,
  ...typescriptTools,
] as const
const server = withContext((ctx) => {
  const server = new McpServer({
    name: "claude-crew-mcp-server",
    version: version,
  })

  for (const registerTool of tools) {
    registerTool({
      ...ctx,
      server,
    })
  }

  return server
})

export const startMcpServer = withContext(async (ctx) => {
  const transport = new StdioServerTransport()
  await server(ctx).connect(transport)
})
