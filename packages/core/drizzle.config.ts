import { z } from "zod"
import type { Config } from "drizzle-kit"

export default {
  schema: "./src/lib/drizzle/schema",
  dialect: "postgresql",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env["DATABASE_URL"],
  },
} satisfies Config
