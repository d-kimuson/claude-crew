import type { Config } from "drizzle-kit"

export default {
  schema: "./src/core/lib/drizzle/schema",
  dialect: "postgresql",
  out: "./drizzle/migrations",
} satisfies Config
