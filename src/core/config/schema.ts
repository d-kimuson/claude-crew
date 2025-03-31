import { z } from "zod"

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
  shell: z
    .object({
      enable: z.boolean().default(true),
      allowedCommands: z.array(z.string()).default(["pnpm"]),
    })
    .default({}),
  embedding: z.object({
    // want to provide providers that can be used completely locally
    provider: z.object({
      type: z.literal("openai"),
      apiKey: z.string(),
      model: z.string().default("text-embedding-ada-002"),
    }),
  }),
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
})

export type Config = z.infer<typeof configSchema>
