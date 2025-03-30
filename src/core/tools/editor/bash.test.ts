import { execSync } from "node:child_process"
import { describe, it, expect, vi } from "vitest"
import { contextFactory } from "../../../../test/helpers/context"
import { execBash } from "./bash"

vi.mock("node:child_process")

class ExecSyncMockError extends Error {
  constructor(
    message: string,
    public stdout: string,
    public stderr: string,
    public status: number,
    public pid: number,
    public output: (string | null)[]
  ) {
    super(message)
  }
}

describe("execBash", () => {
  const mockContext = contextFactory()

  const execBashWithConfig = execBash(mockContext)

  describe("Given a bash command", () => {
    describe("When the command executes successfully", () => {
      it("Then should return the command output", () => {
        const expectedOutput = "command output"
        vi.mocked(execSync).mockReturnValue(expectedOutput)

        const result = execBashWithConfig("echo 'test'")

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value).toBe(expectedOutput)
        }
        expect(execSync).toHaveBeenCalledWith("echo 'test'", {
          cwd: mockContext.config.directory,
          encoding: "utf-8",
        })
      })
    })

    describe("When the command fails with ExecSyncError", () => {
      it("Then should return a DiscriminatedError", () => {
        vi.mocked(execSync).mockImplementation(() => {
          throw new ExecSyncMockError(
            "failed to execute command",
            "stdout",
            "stderr",
            1,
            123,
            [null, "stdout", "stderr"]
          )
        })

        const result = execBashWithConfig("invalid-command")

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.code).toBe("EXEC_BASH_FAILED")
          expect(result.error.message).toBe("failed to execute command")
          expect(result.error.details).toStrictEqual({
            stdout: "stdout",
            stderr: "stderr",
          })
        }
      })

      it("Then should handle empty stdout/stderr", () => {
        vi.mocked(execSync).mockImplementation(() => {
          const error = new ExecSyncMockError(
            "failed to execute command",
            "stdout",
            "stderr",
            1,
            123,
            [null, "failed to execute command"]
          )
          throw error
        })

        const result = execBashWithConfig("invalid-command")

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.code).toBe("EXEC_BASH_FAILED")
          expect(result.error.message).toBe("failed to execute command")
          expect(result.error.details).toStrictEqual({
            stdout: "stdout",
            stderr: "stderr",
          })
        }
      })
    })

    describe("When the command fails with an unexpected error", () => {
      it("Then should return an unhandled error", () => {
        const error = new Error("Unexpected error")
        vi.mocked(execSync).mockImplementation(() => {
          throw error
        })

        const result = execBashWithConfig("invalid-command")

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error).toMatchObject({
            details: {
              method: "execBash",
            },
          })
        }
      })
    })

    describe("When the command fails with a non-Error object", () => {
      it("Then should throw an error", () => {
        vi.mocked(execSync).mockImplementation(() => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error -- for test
          throw {
            success: false,
          }
        })

        expect(() => execBashWithConfig("invalid-command")).toThrow(
          "illegal state: error is not an instance of Error"
        )
      })
    })
  })
})
