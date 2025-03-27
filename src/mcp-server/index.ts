import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { zodToJsonSchema } from "zod-to-json-schema"
import { version } from "../../package.json"
import { loadConfig } from "../core/config/loadConfig"
import { editorTools } from "./tools/editor"
import { prepareTool } from "./tools/prepare"
import { ragTools } from "./tools/rag"

const declaredTools = [prepareTool, ...editorTools, ...ragTools] as const

const server = (configPath: string) => {
  const config = loadConfig(configPath)
  const tools = declaredTools.map((declare) => declare({ config, configPath }))

  const server = new Server(
    {
      name: "claude-crew-mcp-server",
      version: version,
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  )

  server.setRequestHandler(ListToolsRequestSchema, () => {
    return {
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: zodToJsonSchema(tool.inputSchema),
      })),
    }
  })

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: _args } = request.params
      const tool = tools.find((tool) => tool.name === name)

      if (!tool) {
        throw new Error(`Unknown tool: ${name}`)
      }

      const parsed = tool.inputSchema.safeParse(_args)
      if (!parsed.success) {
        return {
          isError: true,
          content: parsed.error.errors.map((error) => ({
            type: "text",
            text: error.message,
          })),
        }
      }

      return {
        isError: false,
        content: [
          {
            type: "text",
            // @ts-expect-error --
            text: JSON.stringify(await tool.execute(parsed.data)),
          },
        ],
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
        isError: true,
      }
    }
  })

  return server
}

export const startMcpServer = async (configPath: string) => {
  const transport = new StdioServerTransport()
  await server(configPath).connect(transport)
}
