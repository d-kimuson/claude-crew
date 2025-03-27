import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["./src/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
  },
})
