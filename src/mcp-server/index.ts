import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { version } from "../../package.json"
import { loadConfig } from "../core/config/loadConfig"
import { editorTools } from "./tools/editor"
import { prepareTool } from "./tools/prepare"
import { ragTools } from "./tools/rag"
import { think } from "./tools/think"

const tools = [prepareTool, think, ...editorTools, ...ragTools] as const

const server = (configPath: string) => {
  const config = loadConfig(configPath)

  const server = new McpServer({
    name: "claude-crew-mcp-server",
    version: version,
  })

  for (const registerTool of tools) {
    registerTool({
      server,
      config,
      configPath,
    })
  }

  return server
}

export const startMcpServer = async (configPath: string) => {
  const transport = new StdioServerTransport()
  await server(configPath).connect(transport)
}
