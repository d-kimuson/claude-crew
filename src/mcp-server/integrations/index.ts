import { typescriptIntegration } from "./typescript"

export const integrations = [typescriptIntegration] as const

export type IntegrationNames = (typeof integrations)[number]["config"]["name"]
