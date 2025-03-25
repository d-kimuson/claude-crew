// @ts-check
import { exec, execSync } from "child_process"
import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"
import { exit } from "process"

exec(
  `pnpm lint:cspell | grep 'Unknown word' | cut -d '(' -f 2 | cut -d ')' -f 1`,
  (error, stdout) => {
    if (error !== null) {
      console.error(error)
      exit(1)
    }

    try {
      const words = stdout.split("\n").filter((t) => t !== "")

      if (words.length === 0) {
        console.log("Unknown words not found.")
        return
      }

      /** @type {import('cspell').CSpellSettings} */
      const jsonData = JSON.parse(
        readFileSync(resolve(".", "cspell.json"), { encoding: "utf8" })
      )
      /** @type {string[]} */
      const initial = []
      /** @type {string[]} */
      const updatedWords = [
        ...new Set(initial.concat(jsonData.words ?? []).concat(words)),
      ]

      writeFileSync(
        resolve(".", "cspell.json"),
        JSON.stringify({ ...jsonData, words: updatedWords }, null, 2)
      )

      execSync("pnpm prettier cspell.json --write")
      execSync("git diff cspell.json", { encoding: "utf8", stdio: "inherit" })

      console.log(
        "Unknown words added to cspell.json.\n" +
          "Please make sure it is not a typo before committing."
      )
    } catch (err) {
      console.error(err)
      exit(1)
    }
  }
)
