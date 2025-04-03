import type { z } from "zod"
import { ragIntegration } from "./rag"
import { shellIntegration } from "./shell"
import { typescriptIntegration } from "./typescript"

export const integrations = [
  typescriptIntegration,
  ragIntegration,
  shellIntegration,
] as const

export type IntegrationNames = (typeof integrations)[number]["config"]["name"]

export type GetIntegrationConfig<T extends IntegrationNames> =
  (typeof integrations)[number]["config"] extends infer I
    ? I extends { name: T; configSchema: infer I2 }
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        I2 extends z.ZodType<any, any, any>
        ? z.infer<I2>
        : never
      : never
    : never
