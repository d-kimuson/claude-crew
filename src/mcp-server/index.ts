import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { version } from "../../package.json"
import { withContext } from "../core/context/withContext"
import { integrations } from "./integrations"
import { editorTools } from "./tools/editor"
import { prepareTool } from "./tools/prepare"
import { think } from "./tools/think"

const tools = [prepareTool, think, ...editorTools] as const

const server = withContext(async (ctx) => {
  const server = new McpServer({
    name: "claude-crew-mcp-server",
    version: version,
  })

  const integrationTools = integrations.flatMap((integration) =>
    integration.register(ctx)
  )

  for (const registerTool of [...tools, ...integrationTools]) {
    await registerTool({
      ...ctx,
      server,
    })
  }

  return server
})

export const startMcpServer = withContext(async (ctx) => {
  const transport = new StdioServerTransport()
  const mcpServer = await server(ctx)
  await mcpServer.connect(transport)
})
