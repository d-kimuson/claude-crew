import yargs from "yargs"
import { hideBin } from "yargs/helpers"

const commands = {
  setup: "setup",
} as const

const main = async () => {
  const argv = await yargs(hideBin(process.argv))
    .command(commands.setup, "Setup the project", (setup) => {
      setup.help()
    })
    .help().argv

  switch (argv._[0]) {
    case commands.setup: {
      // TODO: Implement setup command
      throw new Error("Not implemented")
    }

    default:
      throw new Error(`Invalid command: ${argv._[0]}`)
  }
}

await main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
