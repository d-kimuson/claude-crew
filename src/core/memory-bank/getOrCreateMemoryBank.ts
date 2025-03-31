import { existsSync } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { withContext } from "../context/withContext"

const initialMemoryBank = `
## ProjectBrief

FIXME: write initial project brief

## ProductContext

## SystemPatterns

## CodingGuidelines
`

export const getOrCreateMemoryBank = withContext(async (ctx) => {
  const memoryBankPath = resolve(
    ctx.config.directory,
    ".claude-crew",
    "memory-bank.md"
  )
  if (existsSync(memoryBankPath)) {
    return await readFile(memoryBankPath, {
      encoding: "utf-8",
    })
  }

  await writeFile(memoryBankPath, initialMemoryBank, {
    encoding: "utf-8",
  })

  return initialMemoryBank
})
