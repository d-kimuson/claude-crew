import { createPatch } from "diff"

export const textDiff = (oldText: string, newText: string): string => {
  if (oldText === newText) return ""

  const patch = createPatch("file", oldText, newText, "", "")

  // Skip the first 4 lines (header) and join the remaining lines
  const lines = patch.split("\n").slice(4)

  return lines
    .filter(
      (line) =>
        line.startsWith(" ") || line.startsWith("+") || line.startsWith("-")
    )
    .join("\n")
}
