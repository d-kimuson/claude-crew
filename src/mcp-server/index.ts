import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { zodToJsonSchema } from "zod-to-json-schema"
import { version } from "../../package.json"
import { editorTools } from "./tools/editor"
import { prepareTool } from "./tools/prepare"
import { ragTools } from "./tools/rag"

const tools = [prepareTool, ...editorTools, ...ragTools] as const

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
    tools: tools
      .map((declareFn) => declareFn())
      .map((declare) => ({
        name: declare.name,
        description: declare.description,
        inputSchema: zodToJsonSchema(declare.inputSchema),
      })),
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: _args } = request.params
    const tool = tools
      .map((declareFn) => declareFn())
      .find((declare) => declare.name === name)

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
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    }
  }
})

export const startMcpServer = async () => {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
