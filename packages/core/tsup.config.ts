import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  dts: true,
  tsconfig: "./tsconfig.src.json",
  bundle: true,
})
