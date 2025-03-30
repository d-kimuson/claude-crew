import { z } from "zod"
import { editorTools as coreEditorTools } from "../../core/tools/editor"
import { defineTool } from "../utils/defineTool"

export const editorTools = [
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
              { type: "text", text: `Error: ${JSON.stringify(error)}` },
            ],
          }
        }
      }
    )
  ),

  defineTool(({ server, ...ctx }) =>
    server.tool(
      `${ctx.config.name}-exec-bash`,
      `Execute a bash command`,
      {
        command: z.string().describe("Command to execute"),
      },
      (input) => {
        try {
          const stdout = coreEditorTools(ctx).execBash(input.command)
          return {
            isError: false,
            content: [{ type: "text", text: JSON.stringify(stdout) }],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              { type: "text", text: `Error: ${JSON.stringify(error)}` },
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
          .describe("Maximum number of lines to read"),
        offset: z
          .number()
          .optional()
          .describe("Line offset to start reading from"),
      },
      async (input) => {
        try {
          const content = await coreEditorTools(ctx).readFile(
            input.filePath,
            input.maxLine,
            input.offset
          )
          return {
            isError: false,
            content: [{ type: "text", text: JSON.stringify(content) }],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              { type: "text", text: `Error: ${JSON.stringify(error)}` },
            ],
          }
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
          await coreEditorTools(ctx).writeFile(input.filePath, input.content)
          return {
            isError: false,
            content: [{ type: "text", text: `success` }],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              { type: "text", text: `Error: ${JSON.stringify(error)}` },
            ],
          }
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
          await coreEditorTools(ctx).replaceFile(
            input.filePath,
            input.pattern,
            input.replace
          )
          return {
            isError: false,
            content: [{ type: "text", text: `success` }],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              { type: "text", text: `Error: ${JSON.stringify(error)}` },
            ],
          }
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
          const files = await coreEditorTools(ctx).glob(
            input.pattern,
            input.cwd
          )
          return {
            isError: false,
            content: [{ type: "text", text: JSON.stringify(files) }],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              { type: "text", text: `Error: ${JSON.stringify(error)}` },
            ],
          }
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
          const result = await coreEditorTools(ctx).grep(
            input.pattern,
            input.options
          )
          return {
            isError: false,
            content: [{ type: "text", text: JSON.stringify(result) }],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              { type: "text", text: `Error: ${JSON.stringify(error)}` },
            ],
          }
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
          const result = coreEditorTools(ctx).testFile(input.filePath)
          return {
            isError: false,
            content: [{ type: "text", text: JSON.stringify(result) }],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              { type: "text", text: `Error: ${JSON.stringify(error)}` },
            ],
          }
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
        const result = await coreEditorTools(ctx).checkAll()
        return {
          isError: false,
          content: [{ type: "text", text: JSON.stringify(result) }],
        }
      }
    )
  ),
]
