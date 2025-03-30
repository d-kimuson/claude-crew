import { existsSync } from "fs"
import { writeFile, readFile } from "fs/promises"
import { mkdir } from "node:fs/promises"
import { dirname } from "node:path"
import { glob } from "glob"
import { err } from "neverthrow"
import { describe, it, expect, vi } from "vitest"
import { contextFactory } from "../../../../test/helpers/context"
import { DiscriminatedError } from "../../errors/DiscriminatedError"
import { editorTools } from "./index"
import { execBash } from "./bash"
import { checkModifiedFiles, testModifiedFiles } from "./checks"
import { toAbsolutePath } from "./toAbsolutePath"

vi.mock("fs")
vi.mock("fs/promises")
vi.mock("node:fs/promises")
vi.mock("node:path")
vi.mock("glob")
vi.mock("./bash")
vi.mock("./checks")
vi.mock("./toAbsolutePath")

describe("editorTools", () => {
  const mockContext = contextFactory()

  const tools = editorTools(mockContext)

  beforeEach(() => {
    vi.mocked(toAbsolutePath).mockReturnValue((path: string) =>
      path.startsWith("/") ? path : `/test/project/${path}`
    )
    vi.mocked(dirname).mockImplementation((path: string) => {
      const parts = path.split("/")
      parts.pop()
      return parts.join("/")
    })
  })

  describe("execBash", () => {
    describe("When command succeeds", () => {
      it("Then should return success result", () => {
        const execBashMock = vi.fn().mockReturnValue({
          match: (success: (output: string) => unknown) =>
            success("Command output"),
        })
        vi.mocked(execBash).mockReturnValue(execBashMock)

        const result = tools.execBash("test command")

        expect(result).toEqual({
          success: true,
          command: "test command",
          stdout: "Command output",
        })
      })
    })

    describe("When command fails", () => {
      it("Then should return error result", () => {
        const execBashMock = vi.fn().mockReturnValue(
          err(
            new DiscriminatedError("EXEC_BASH_FAILED", "Command failed", {
              method: "dummy",
            })
          )
        )
        vi.mocked(execBash).mockReturnValue(execBashMock)

        const result = tools.execBash("test command")

        expect(result).toEqual({
          success: false,
          command: "test command",
          error: {
            message: "Command failed",
            method: "dummy",
          },
        })
      })
    })
  })

  describe("readFile", () => {
    describe("When file exists", () => {
      it("Then should return file content with pagination", async () => {
        vi.mocked(existsSync).mockReturnValue(true)
        vi.mocked(readFile).mockResolvedValue("line1\nline2\nline3\nline4")

        const result = await tools.readFile("test.txt", 2)

        expect(result).toEqual({
          success: true,
          content: "line1\nline2",
          nextOffset: 3,
        })
      })

      it("Then should handle last page", async () => {
        vi.mocked(existsSync).mockReturnValue(true)
        vi.mocked(readFile).mockResolvedValue("line1\nline2")

        const result = await tools.readFile("test.txt", 3)

        expect(result).toEqual({
          success: true,
          content: "line1\nline2",
          nextOffset: null,
        })
      })
    })

    describe("When file does not exist", () => {
      it("Then should return error", async () => {
        vi.mocked(existsSync).mockReturnValue(false)

        const result = await tools.readFile("nonexistent.txt")

        expect(result).toEqual({
          success: false,
          error: {
            reason: "No such file or directory",
            filePath: "nonexistent.txt",
          },
        })
      })
    })
  })

  describe("mkdir", () => {
    it("Then should create directory", async () => {
      vi.mocked(dirname).mockReturnValue("/test/project/test")

      await tools.mkdir("test/dir")

      expect(mkdir).toHaveBeenCalledWith("/test/project/test", {
        recursive: true,
      })
    })
  })

  describe("writeFile", () => {
    describe("When directory exists", () => {
      it("Then should write file and run checks", async () => {
        vi.mocked(existsSync).mockReturnValue(true)
        vi.mocked(checkModifiedFiles).mockReturnValue(() => [
          {
            success: true,
            command: "check",
            stdout: "Check passed",
          },
        ])
        vi.mocked(testModifiedFiles).mockReturnValue(() => [
          {
            file: "test.txt",
            hasError: false,
            supplement: "No test file exists.",
          },
        ])

        const result = await tools.writeFile("test.txt", "content")

        expect(writeFile).toHaveBeenCalledWith(
          "/test/project/test.txt",
          "content",
          { encoding: "utf-8" }
        )
        expect(result).toEqual({
          success: true,
          checkResults: [
            {
              success: true,
              command: "check",
              stdout: "Check passed",
            },
            {
              file: "test.txt",
              hasError: false,
              supplement: "No test file exists.",
            },
          ],
        })
      })
    })

    describe("When directory does not exist", () => {
      it("Then should create directory and write file", async () => {
        vi.mocked(existsSync).mockReturnValue(false)
        vi.mocked(checkModifiedFiles).mockReturnValue(() => [])
        vi.mocked(testModifiedFiles).mockReturnValue(() => [])

        await tools.writeFile("test/file.txt", "content")

        expect(mkdir).toHaveBeenCalledWith("/test/project/test", {
          recursive: true,
        })
        expect(writeFile).toHaveBeenCalledWith(
          "/test/project/test/file.txt",
          "content",
          { encoding: "utf-8" }
        )
      })
    })
  })

  describe("replaceFile", () => {
    describe("When file exists", () => {
      it("Then should replace content and run checks", async () => {
        vi.mocked(existsSync).mockReturnValue(true)
        vi.mocked(readFile).mockResolvedValue("old content")
        vi.mocked(checkModifiedFiles).mockReturnValue(() => [])
        vi.mocked(testModifiedFiles).mockReturnValue(() => [])

        const result = await tools.replaceFile("test.txt", "old", "new")

        expect(writeFile).toHaveBeenCalledWith(
          "/test/project/test.txt",
          "new content",
          { encoding: "utf-8" }
        )
        expect(result.success).toBe(true)
      })
    })

    describe("When file does not exist", () => {
      it("Then should return error", async () => {
        vi.mocked(existsSync).mockReturnValue(false)

        const result = await tools.replaceFile("nonexistent.txt", "old", "new")

        expect(result).toEqual({
          success: false,
          error: {
            reason: "No such file or directory",
            filePath: "nonexistent.txt",
          },
        })
      })
    })
  })

  describe("glob", () => {
    describe("When pattern matches files", () => {
      it("Then should return matching files", async () => {
        vi.mocked(glob).mockResolvedValue(["file1.ts", "file2.ts"])

        const result = await tools.glob("**/*.ts")

        expect(result).toEqual({
          success: true,
          matches: ["file1.ts", "file2.ts"],
        })
        expect(glob).toHaveBeenCalledWith("**/*.ts", {
          cwd: "/test/project",
        })
      })

      it("Then should use custom cwd when provided", async () => {
        vi.mocked(glob).mockResolvedValue(["file1.ts"])

        await tools.glob("**/*.ts", "src")

        expect(glob).toHaveBeenCalledWith("**/*.ts", {
          cwd: "/test/project/src",
        })
      })
    })
  })

  describe("grep", () => {
    describe("When pattern matches content", () => {
      it("Then should return matching lines", async () => {
        vi.mocked(glob).mockResolvedValue(["file1.ts"])
        vi.mocked(readFile).mockResolvedValue("other\nTODO: fix\nother")

        const result = await tools.grep("other", { filePattern: "*.ts" })

        expect(result).toEqual({
          success: true,
          matches: [
            {
              file: "/test/project/file1.ts",
              line: 1,
              content: "other",
            },
            {
              file: "/test/project/file1.ts",
              line: 3,
              content: "other",
            },
          ],
          count: 2,
        })
      })
    })
  })

  describe("testFile", () => {
    describe("When file exists", () => {
      it("Then should run test command", () => {
        vi.mocked(existsSync).mockReturnValue(true)
        const execBashMock = vi.fn().mockReturnValue({
          match: (success: (output: string) => unknown) =>
            success("Test passed"),
        })
        vi.mocked(execBash).mockReturnValue(execBashMock)

        tools.testFile("test.ts")

        expect(execBashMock).toHaveBeenCalledWith(
          "pnpm vitest run /test/project/test.ts"
        )
      })
    })

    describe("When file does not exist", () => {
      it("Then should return error", () => {
        vi.mocked(existsSync).mockReturnValue(false)

        const result = tools.testFile("nonexistent.ts")

        expect(result).toEqual({
          success: false,
          error: {
            reason: "No such file or directory",
            filePath: "nonexistent.ts",
          },
        })
      })
    })
  })

  describe("checkAll", () => {
    it("Then should run all check commands", async () => {
      const execBashMock = vi.fn().mockReturnValue({
        match: (success: (output: string) => unknown) =>
          success("Check passed"),
      })
      vi.mocked(execBash).mockReturnValue(execBashMock)

      const result = await tools.checkAll()

      expect(result).toEqual({
        checkResults: [
          {
            success: true,
            command: "pnpm tsc -p . --noEmit",
            stdout: "Check passed",
          },
          {
            success: true,
            command: "pnpm test",
            stdout: "Check passed",
          },
        ],
      })
    })
  })
})
