import { editorTools as coreEditorTools } from "@claude-crew/core"
import { z } from "zod"
import { defineTool } from "../utils/defineTool"

export const editorTools = [
  defineTool({
    name: `mkdir`,
    description: `Create a directory`,
    inputSchema: z.object({
      filePath: z.string().describe("file path to edit"),
    }),
    execute: async (config, input) => {
      return await coreEditorTools(config).mkdir(input.filePath)
    },
  }),

  defineTool({
    name: `exec-bash`,
    description: `Execute a bash command`,
    inputSchema: z.object({
      command: z.string().describe("Command to execute"),
    }),
    execute: (config, input) => {
      return coreEditorTools(config).execBash(input.command)
    },
  }),

  defineTool({
    name: `read-file`,
    description: `Read the contents of a file`,
    inputSchema: z.object({
      filePath: z.string().describe("File path to read"),
      maxLine: z
        .number()
        .optional()
        .describe("Maximum number of lines to read"),
      offset: z
        .number()
        .optional()
        .describe("Line offset to start reading from"),
    }),
    execute: async (config, input) => {
      return await coreEditorTools(config).readFile(
        input.filePath,
        input.maxLine,
        input.offset
      )
    },
  }),

  defineTool({
    name: `write-file`,
    description: `Write content to a file`,
    inputSchema: z.object({
      filePath: z.string().describe("File path to write to"),
      content: z.string().describe("Content to write"),
    }),
    execute: async (config, input) => {
      return await coreEditorTools(config).writeFile(
        input.filePath,
        input.content
      )
    },
  }),

  defineTool({
    name: `replace-file`,
    description: `Replace content in a file using regex pattern`,
    inputSchema: z.object({
      filePath: z.string().describe("File path to modify"),
      pattern: z.string().describe("Regex pattern to match"),
      replace: z.string().describe("Replacement string"),
    }),
    execute: async (config, input) => {
      return await coreEditorTools(config).replaceFile(
        input.filePath,
        input.pattern,
        input.replace
      )
    },
  }),

  defineTool({
    name: `glob`,
    description: `Find files matching a glob pattern`,
    inputSchema: z.object({
      pattern: z.string().describe("Glob pattern to match"),
      cwd: z.string().optional().describe("Working directory for the search"),
    }),
    execute: async (config, input) => {
      return await coreEditorTools(config).glob(input.pattern, input.cwd)
    },
  }),

  defineTool({
    name: `grep`,
    description: `Search for a pattern in files`,
    inputSchema: z.object({
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
    }),
    execute: async (config, input) => {
      return await coreEditorTools(config).grep(input.pattern, input.options)
    },
  }),

  defineTool({
    name: "test-file",
    description: `Run test file`,
    inputSchema: z.object({
      filePath: z.string().describe("File path to test"),
    }),
    execute: async (config, input) => {
      return await coreEditorTools(config).testFile(input.filePath)
    },
  }),

  defineTool({
    name: `check-all`,
    description: `Run all check commands`,
    inputSchema: z.object({}),
    execute: async (config) => {
      return await coreEditorTools(config).checkAll()
    },
  }),
]
