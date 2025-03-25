import { typescript } from "@claude-crew/eslint-config/typescript"
import type { FlatConfig } from "@typescript-eslint/utils/ts-eslint"

const eslintConfig: FlatConfig.ConfigArray = [
  {
    ignores: ["out"],
  },
  ...typescript(import.meta.dirname, {
    tsconfigPaths: [
      "./tsconfig.src.json",
      "./tsconfig.config.json",
      "./tsconfig.json",
    ],
  }),
]

export default eslintConfig
