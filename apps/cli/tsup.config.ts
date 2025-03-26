import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  tsconfig: "./tsconfig.src.json",
  bundle: true,
  skipNodeModulesBundle: false,
  platform: "node",
  noExternal: [/(.*)/],
})
