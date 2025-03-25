import { Diff } from "diff"

export const textDiff = (oldText: string, newText: string) => {
  const diff = new Diff()
  return diff.diff(oldText, newText)
}
