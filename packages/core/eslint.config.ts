import { react } from "@claude-crew/eslint-config/react"
import { typescript } from "@claude-crew/eslint-config/typescript"
import type { FlatConfig } from "@typescript-eslint/utils/ts-eslint"

const eslintConfig: FlatConfig.ConfigArray = [
  {
    ignores: [
      "src/components/ui",
      "postcss.config.mjs",
      ".next",
      "out",
      "src/lib/$path.ts",
      "next.config.ts",
      "eslint.config.ts",
      "drizzle.config.ts",
    ],
  },
  ...typescript(import.meta.dirname, {
    tsconfigPaths: ["./tsconfig.json"],
  }),
  ...react(),
]

export default eslintConfig
