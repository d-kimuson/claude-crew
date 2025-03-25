import { z } from "zod"

export const configSchema = z.object({
  name: z.string(),
  directory: z.string(),
  language: z.string().default("日本語"),
  commands: z.object({
    install: z.string().default("pnpm i"),
    build: z.string().default("pnpm build"),
    test: z.string().default("pnpm vitest run <file>"),
    checks: z.array(z.string()).default(["pnpm tsc -p . --noEmit"]),
    checkFiles: z.array(z.string()).default(["pnpm eslint --fix <files>"]),
  }),
})

export type Config = z.infer<typeof configSchema>
