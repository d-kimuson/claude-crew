import tsEslint from "typescript-eslint"
import reactPlugin from "eslint-plugin-react"
import globals from "globals"

/**
 * TODO: eslint-plugin-react-hooks の FlatConfig サポートがまだなので未追加
 */
export const react = (
  options?: Partial<{
    jsxRuntime: boolean
  }>
) => {
  const jsxRuntime = options?.jsxRuntime ?? true
  const jsxRuntimeConfig = reactPlugin.configs.flat["jsx-runtime"]

  return tsEslint.config(
    reactPlugin.configs.flat["recommended"] ?? [],
    jsxRuntime && jsxRuntimeConfig !== undefined ? [jsxRuntimeConfig] : [],
    {
      files: ["**/*.{tsx,jsx}"],
      languageOptions: {
        globals: {
          ...globals.browser,
        },
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      settings: {
        react: {
          version: "detect",
        },
      },
    }
  )
}
