import type { InternalToolResult } from "../../core/tools/interface"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { serializeError } from "../../core/errors/serializeError"

export const toResponse = ({
  success,
  ...result
}: InternalToolResult): CallToolResult => {
  if (success) {
    return {
      hasError: false,
      content: [{ type: "text", text: JSON.stringify(result) }],
    }
  }

  return {
    hasError: true,
    content: [{ type: "text", text: JSON.stringify(result.error) }],
  }
}

export const toErrorResponse = (error: unknown): CallToolResult => {
  return {
    hasError: true,
    content: [{ type: "text", text: JSON.stringify(serializeError(error)) }],
  }
}
