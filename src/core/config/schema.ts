import { z } from "zod"
import { ragIntegration } from "../../mcp-server/integrations/rag"
import { shellIntegration } from "../../mcp-server/integrations/shell"
import { typescriptIntegration } from "../../mcp-server/integrations/typescript"

export const configSchema = z.object({
  name: z.string(),
  directory: z.string(),
  language: z.string().default("日本語"),
  commands: z.object({
    install: z.string().default("pnpm i"),
    build: z.string().default("pnpm build"),
    test: z.string().default("pnpm test"),
    testFile: z.string().default("pnpm test <file>"),
    checks: z.array(z.string()).default(["pnpm tsc -p . --noEmit"]),
    checkFiles: z.array(z.string()).default(["pnpm eslint --fix <files>"]),
  }),
  git: z
    .object({
      defaultBranch: z.string().default("main"),
      autoPull: z.boolean().default(true),
    })
    .default({}),
  database: z.union([
    z.object({
      customDb: z.literal(true),
      url: z.string().describe("postgres url"),
    }),
    z.object({
      customDb: z.literal(false),
      port: z.number(),
      url: z.string().describe("postgres url"),
    }),
  ]),
  integrations: z
    .array(
      z.union([
        z.object({
          name: z.literal(typescriptIntegration.config.name),
          config: typescriptIntegration.config.configSchema,
        }),
        z.object({
          name: z.literal(ragIntegration.config.name),
          config: ragIntegration.config.configSchema,
        }),
        z.object({
          name: z.literal(shellIntegration.config.name),
          config: shellIntegration.config.configSchema,
        }),
      ])
    )
    .default([]),
})

export type Config = z.infer<typeof configSchema>
