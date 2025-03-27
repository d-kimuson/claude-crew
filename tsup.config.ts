import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  tsconfig: "./tsconfig.src.json",
  dts: false,
  clean: true,
  bundle: true,
  minify: true,
  target: "node20",
  banner: {
    js: "#!/usr/bin/env node",
  },
})
