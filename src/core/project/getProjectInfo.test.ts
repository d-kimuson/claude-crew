import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getProjectInfo } from "./getProjectInfo"

vi.mock("node:fs")
vi.mock("node:fs/promises")
vi.mock("node:path")

describe("getProjectInfo", () => {
  const mockProjectDir = "/mock/project"
  const mockPackageJson = {
    dependencies: {
      "test-dep": "^1.0.0",
    },
    devDependencies: {
      "test-dev-dep": "^2.0.0",
    },
  }

  beforeEach(() => {
    vi.mocked(resolve).mockImplementation((...paths) => paths.join("/"))
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockPackageJson))
    vi.mocked(existsSync).mockReturnValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("Given a valid package.json", () => {
    describe("When reading project information", () => {
      it("Then should return dependency information and unknown package manager", async () => {
        const result = await getProjectInfo(mockProjectDir)

        expect(result).toEqual({
          dependencyText: JSON.stringify({
            dependencies: mockPackageJson.dependencies,
            devDependencies: mockPackageJson.devDependencies,
          }),
          packageManager: "unknown",
        })
      })
    })
  })

  describe("Given an invalid package.json", () => {
    describe("When reading project information fails", () => {
      it("Then should return error message and unknown package manager", async () => {
        vi.mocked(readFile).mockRejectedValue(new Error("File not found"))

        const result = await getProjectInfo(mockProjectDir)

        expect(result).toEqual({
          dependencyText: "Failed to get package.json",
          packageManager: "unknown",
        })
      })
    })
  })

  describe("Given package manager detection", () => {
    describe("When package.json contains packageManager field", () => {
      it("Then should return the specified package manager version", async () => {
        vi.mocked(readFile).mockResolvedValue(
          JSON.stringify({
            ...mockPackageJson,
            packageManager: "pnpm@10.6.5",
          })
        )

        const result = await getProjectInfo(mockProjectDir)

        expect(result.packageManager).toBe("pnpm@10.6.5")
      })
    })

    describe("When yarn.lock exists", () => {
      it("Then should return yarn as package manager", async () => {
        vi.mocked(existsSync).mockImplementation((path) =>
          path.toString().includes("yarn.lock")
        )

        const result = await getProjectInfo(mockProjectDir)

        expect(result.packageManager).toBe("yarn")
      })
    })

    describe("When pnpm-lock.yaml exists", () => {
      it("Then should return pnpm as package manager", async () => {
        vi.mocked(existsSync).mockImplementation((path) =>
          path.toString().includes("pnpm-lock.yaml")
        )

        const result = await getProjectInfo(mockProjectDir)

        expect(result.packageManager).toBe("pnpm")
      })
    })

    describe("When package-lock.json exists", () => {
      it("Then should return npm as package manager", async () => {
        vi.mocked(existsSync).mockImplementation((path) =>
          path.toString().includes("package-lock.json")
        )

        const result = await getProjectInfo(mockProjectDir)

        expect(result.packageManager).toBe("npm")
      })
    })

    describe("When no lock file exists", () => {
      it("Then should return unknown as package manager", async () => {
        vi.mocked(existsSync).mockReturnValue(false)

        const result = await getProjectInfo(mockProjectDir)

        expect(result.packageManager).toBe("unknown")
      })
    })
  })
})
