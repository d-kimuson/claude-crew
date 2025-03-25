import eslint from "@eslint/js"
import tsEslint from "typescript-eslint"
import ununsedImports from "eslint-plugin-unused-imports"
// @ts-expect-error -- 型定義が提供されていない
import importPlugin from "eslint-plugin-import"

export const typescript = (
  dirname: string,
  options?: Partial<{
    tsconfigPaths: string[]
  }>
) => {
  const tsconfigPaths = options?.tsconfigPaths ?? ["./tsconfig.json"]

  return tsEslint.config(
    eslint.configs.recommended,
    tsEslint.configs.recommendedTypeChecked,
    tsEslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          project: tsconfigPaths,
          tsconfigRootDir: dirname,
        },
      },
      plugins: {
        "unused-imports": ununsedImports,
        import: importPlugin,
      },
      settings: {
        /**
         * @see https://github.com/import-js/eslint-plugin-import/issues/2556#issuecomment-1419518561
         */
        "import/parsers": {
          "@typescript-eslint/parser": [".ts", ".tsx"],
          espree: [".js", ".cjs", ".mjs", ".jsx"],
        },
        "import/resolver": {
          typescript: {
            project: [...tsconfigPaths],
            alwaysTryTypes: true,
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
        // dup ってたらいらない
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
      },
    }
  )
}
