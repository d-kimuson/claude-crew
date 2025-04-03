import { z } from "zod"
import { serializeError } from "../../core/errors/serializeError"
import { editorTools as coreEditorTools } from "../../core/tools/editor"
import { defineTool } from "../utils/defineTool"
import { toErrorResponse, toResponse } from "../utils/toResponse"

export const editorTools = [
  defineTool(({ server, ...ctx }) =>
    server.tool(
      `${ctx.config.name}-list-directory`,
      `List files and directories with specified depth`,
      {
        path: z.string().describe("Directory path to list"),
        depth: z
          .number()
          .optional()
          .default(1)
          .describe("Depth of directory traversal"),
      },
      async (input) => {
        try {
          return toResponse(
            await coreEditorTools(ctx).listDirectory(input.path, input.depth)
          )
        } catch (error) {
          return toErrorResponse(error)
        }
      }
    )
  ),
  defineTool(({ server, ...ctx }) =>
    server.tool(
      `${ctx.config.name}-mkdir`,
      `Create a directory`,
      {
        filePath: z.string().describe("file path to edit"),
      },
      async (input) => {
        try {
          await coreEditorTools(ctx).mkdir(input.filePath)
          return {
            isError: false,
            content: [{ type: "text", text: `success` }],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Error: ${JSON.stringify(serializeError(error))}`,
              },
            ],
          }
        }
      }
    )
  ),

  defineTool(({ server, ...ctx }) =>
    server.tool(
      `${ctx.config.name}-read-file`,
      `Read the contents of a file`,
      {
        filePath: z.string().describe("File path to read"),
        maxLine: z
          .number()
          .optional()
          .default(200)
          .describe("Maximum number of lines to read"),
        offset: z
          .number()
          .optional()
          .describe("Line offset to start reading from"),
      },
      async (input) => {
        try {
          return toResponse(
            await coreEditorTools(ctx).readFile(
              input.filePath,
              input.maxLine,
              input.offset
            )
          )
        } catch (error) {
          return toErrorResponse(error)
        }
      }
    )
  ),

  defineTool(({ server, ...ctx }) =>
    server.tool(
      `${ctx.config.name}-write-file`,
      `Write content to a file`,
      {
        filePath: z.string().describe("File path to write to"),
        content: z.string().describe("Content to write"),
      },
      async (input) => {
        try {
          return toResponse(
            await coreEditorTools(ctx).writeFile(input.filePath, input.content)
          )
        } catch (error) {
          return toErrorResponse(error)
        }
      }
    )
  ),

  defineTool(({ server, ...ctx }) =>
    server.tool(
      `${ctx.config.name}-replace-file`,
      `Replace content in a file using regex pattern`,
      {
        filePath: z.string().describe("File path to modify"),
        pattern: z.string().describe("Regex pattern to match"),
        replace: z.string().describe("Replacement string"),
      },
      async (input) => {
        try {
          return toResponse(
            await coreEditorTools(ctx).replaceFile(
              input.filePath,
              input.pattern,
              input.replace
            )
          )
        } catch (error) {
          return toErrorResponse(error)
        }
      }
    )
  ),

  defineTool(({ server, ...ctx }) =>
    server.tool(
      `${ctx.config.name}-glob`,
      `Find files matching a glob pattern`,
      {
        pattern: z.string().describe("Glob pattern to match"),
        cwd: z.string().optional().describe("Working directory for the search"),
      },
      async (input) => {
        try {
          return toResponse(
            await coreEditorTools(ctx).glob(input.pattern, input.cwd)
          )
        } catch (error) {
          return toErrorResponse(error)
        }
      }
    )
  ),

  defineTool(({ server, ...ctx }) =>
    server.tool(
      `${ctx.config.name}-grep`,
      `Search for a pattern in files`,
      {
        pattern: z.string().describe("Regex pattern to search for"),
        options: z
          .object({
            cwd: z
              .string()
              .optional()
              .describe("Working directory for the search"),
            filePattern: z
              .string()
              .optional()
              .describe("Glob pattern for files to search"),
          })
          .optional(),
      },
      async (input) => {
        try {
          return toResponse(
            await coreEditorTools(ctx).grep(input.pattern, input.options)
          )
        } catch (error) {
          return toErrorResponse(error)
        }
      }
    )
  ),

  defineTool(({ server, ...ctx }) =>
    server.tool(
      `${ctx.config.name}-test-file`,
      `Run test file`,
      {
        filePath: z.string().describe("File path to test"),
      },
      (input) => {
        try {
          return toResponse(coreEditorTools(ctx).testFile(input.filePath))
        } catch (error) {
          return toErrorResponse(error)
        }
      }
    )
  ),

  defineTool(({ server, ...ctx }) =>
    server.tool(
      `${ctx.config.name}-check-all`,
      `Run all check commands`,
      {},
      async () => {
        try {
          return toResponse(await coreEditorTools(ctx).checkAll())
        } catch (error) {
          return toErrorResponse(error)
        }
      }
    )
  ),
]
