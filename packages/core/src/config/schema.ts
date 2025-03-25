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
  git: z
    .object({
      defaultBranch: z.string().default("main"),
      branchPrefix: z.string().default("claude-crew/"),
    })
    .default({}),
  github: z
    .object({
      createPullRequest: z.enum(["always", "draft", "never"]).default("draft"),
    })
    .default({}),
  embedding: z.object({
    openAiKey: z.string().describe("openai key"),
  }),
  database: z.object({
    customDb: z.boolean().default(false),
    url: z.string().describe("postgres url"),
  }),
})

export type Config = z.infer<typeof configSchema>
