import { existsSync } from "node:fs"
import { err, ok } from "neverthrow"
import { describe, it, expect, vi } from "vitest"
import type { PathLike } from "node:fs"
import { contextFactory } from "../../../../test/helpers/context"
import { DiscriminatedError } from "../../errors/DiscriminatedError"
import { execBash } from "./bash"
import { checkModifiedFiles, testModifiedFiles } from "./checks"
import { toAbsolutePath } from "./toAbsolutePath"

vi.mock("node:fs")
vi.mock("./bash")
vi.mock("./toAbsolutePath")

describe("checks", () => {
  const mockContext = contextFactory()

  beforeEach(() => {
    vi.mocked(toAbsolutePath).mockReturnValue((path: string) =>
      path.startsWith("/") ? path : `/test/project/${path}`
    )
  })

  describe("checkModifiedFiles", () => {
    const checkModifiedFilesWithConfig = checkModifiedFiles(mockContext)

    describe("Given a list of modified files", () => {
      describe("When all checks pass", () => {
        it("Then should return success results", () => {
          const files = ["file1.ts", "file2.ts"]
          const execBashMock = vi.fn().mockReturnValue(ok("Check passed"))
          vi.mocked(execBash).mockReturnValue(execBashMock)

          const results = checkModifiedFilesWithConfig(files)

          expect(results).toHaveLength(1)
          expect(results[0]).toEqual({
            success: true,
            command:
              "pnpm eslint /test/project/file1.ts /test/project/file2.ts",
            stdout: "Check passed",
          })
        })
      })

      describe("When checks fail", () => {
        it("Then should return error results", () => {
          const files = ["file1.ts", "file2.ts"]
          const execBashMock = vi.fn().mockReturnValue(
            err(
              new DiscriminatedError("EXEC_BASH_FAILED", "Command failed", {
                method: "dummy",
              })
            )
          )
          vi.mocked(execBash).mockReturnValue(execBashMock)

          const results = checkModifiedFilesWithConfig(files)

          expect(results).toHaveLength(1)
          expect(results[0]).toStrictEqual({
            success: false,
            meta: {
              command:
                "pnpm eslint /test/project/file1.ts /test/project/file2.ts",
            },
            error: {
              message: "Command failed",
              method: "dummy",
            },
          })
        })
      })
    })
  })

  describe("testModifiedFiles", () => {
    const testModifiedFilesWithConfig = testModifiedFiles(mockContext)

    describe("Given a list of modified files", () => {
      describe("When file has no test", () => {
        it("Then should return no test exists result", () => {
          vi.mocked(existsSync).mockReturnValue(false)

          const results = testModifiedFilesWithConfig(["file1.ts"])

          expect(results).toHaveLength(1)
          expect(results[0]).toEqual({
            file: "/test/project/file1.ts",
            success: true,
            supplement: "No test file exists.",
          })
        })
      })

      describe("When file has a test and it passes", () => {
        it("Then should return success result", () => {
          vi.mocked(existsSync).mockImplementation((path: PathLike) =>
            path.toString().includes(".test.ts")
          )
          const execBashMock = vi.fn().mockReturnValue({
            isOk: () => true,
          })
          vi.mocked(execBash).mockReturnValue(execBashMock)

          const results = testModifiedFilesWithConfig(["file1.ts"])

          expect(results).toHaveLength(1)
          expect(results[0]).toEqual({
            file: "/test/project/file1.ts",
            testFile: "/test/project/file1.test.ts",
            success: true,
            supplement: "All tests for /test/project/file1.ts passed.",
          })
        })
      })

      describe("When file has a test and it fails", () => {
        it("Then should return error result", () => {
          vi.mocked(existsSync).mockImplementation((path: PathLike) =>
            path.toString().includes(".test.ts")
          )
          const execBashMock = vi.fn().mockReturnValue(
            err(
              new DiscriminatedError("EXEC_BASH_FAILED", "Test failed", {
                method: "dummy",
              })
            )
          )
          vi.mocked(execBash).mockReturnValue(execBashMock)

          const results = testModifiedFilesWithConfig(["file1.ts"])

          expect(results).toHaveLength(1)
          expect(results[0]).toEqual({
            file: "/test/project/file1.ts",
            testFile: "/test/project/file1.test.ts",
            success: false,
            error: {
              message: "Test failed",
              method: "dummy",
            },
          })
        })
      })

      describe("When file is a test file", () => {
        it("Then should test the file itself", () => {
          vi.mocked(existsSync).mockImplementation((arg) => {
            return arg.toString() === "/test/project/file1.test.ts"
          })
          const execBashMock = vi.fn().mockReturnValue({
            isOk: () => true,
          })
          vi.mocked(execBash).mockReturnValue(execBashMock)

          const results = testModifiedFilesWithConfig(["file1.test.ts"])

          expect(results).toHaveLength(1)
          expect(results[0]).toEqual({
            file: "/test/project/file1.test.ts",
            testFile: "/test/project/file1.test.ts",
            success: true,
            supplement: "All tests for /test/project/file1.test.ts passed.",
          })
          expect(execBashMock).toHaveBeenCalledWith(
            "pnpm vitest run /test/project/file1.test.ts"
          )
        })
      })

      describe("When file has an unsupported extension", () => {
        it("Then should return no test exists result", () => {
          const results = testModifiedFilesWithConfig(["file1.txt"])

          expect(results).toHaveLength(1)
          expect(results[0]).toEqual({
            file: "/test/project/file1.txt",
            success: true,
            supplement: "No test file exists.",
          })
        })
      })
    })
  })
})
