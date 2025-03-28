import eslint from "@eslint/js"
// @ts-expect-error -- 型定義が提供されていない
import importPlugin from "eslint-plugin-import"
import ununsedImports from "eslint-plugin-unused-imports"
import tsEslint from "typescript-eslint"
import type { ESLint } from "eslint"

const tsconfigPaths = [
  "./tsconfig.src.json",
  "./tsconfig.config.json",
  "./tsconfig.test.json",
]

export default tsEslint.config(
  {
    ignores: ["dist", "scripts", "coverage", ".prettierrc.js"],
  },
  eslint.configs.recommended,
  tsEslint.configs.recommendedTypeChecked,
  tsEslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: tsconfigPaths,
        tsconfigRootDir: ".",
      },
    },
    plugins: {
      "unused-imports": ununsedImports,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      import: importPlugin as ESLint.Plugin,
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
        espree: [".js", ".cjs", ".mjs", ".jsx"],
      },
      "import/resolver": {
        typescript: {
          project: [...tsconfigPaths],
          alwaysTryTypes: true,
          noWarnOnMultipleProjects: true,
        },
      },
    },
  },
  {
    rules: {
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "type",
            "internal",
            "parent",
            "index",
            "sibling",
            "object",
            "unknown",
          ],
          pathGroups: [
            {
              pattern: "~/**",
              group: "internal",
              position: "before",
            },
          ],
          alphabetize: {
            order: "asc",
          },
          "newlines-between": "never",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "never",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          args: "after-used",
        },
      ],
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-check": false,
          minimumDescriptionLength: 1,
        },
      ],
      "@typescript-eslint/prefer-ts-expect-error": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-explicit-any": ["error"],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/method-signature-style": ["error", "property"],
      "no-console": "error",
    },
  },
  {
    files: ["src/**/*.test.ts"],
    rules: {
      "@typescript-eslint/consistent-type-assertions": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  }
)
