import inquirer from "inquirer"

type SetupAnswers = {
  directory: string
  name: string
  language: string
  installCommand: string
  buildCommand: string
  testCommand: string
  testFileCommand: string
  checkCommand: string
  checkFilesCommand: string
  defaultBranch: string
  branchPrefix: string
  githubPullRequest: "always" | "draft" | "never"
  runtime: "local" | "container"
  openaiApiKey: string
} & (
  | {
      customDb: true
      databaseUrl: string
      databasePort: number
    }
  | {
      customDb: false
      databaseUrl?: undefined
      databasePort?: undefined
    }
)

export const startRepl = async () => {
  const answers = await inquirer.prompt<SetupAnswers>([
    {
      type: "input",
      name: "directory",
      message: "Input project directory",
      default: ".",
    },
    {
      type: "input",
      name: "name",
      message: "Input project name",
    },
    {
      type: "input",
      name: "language",
      message: "Input language to communicate with you",
      default: "日本語",
    },
    {
      type: "input",
      name: "installCommand",
      message: "Input install command",
      default: "pnpm i",
    },
    {
      type: "input",
      name: "buildCommand",
      message: "Input build command",
      default: "pnpm build",
    },
    {
      type: "input",
      name: "testCommand",
      message: "Input full test command",
      default: "pnpm test",
    },
    {
      type: "input",
      name: "testFileCommand",
      message:
        "Input full test file command. <file> is replaced by the file name.",
      default: "pnpm vitest run <file>",
    },
    {
      type: "input",
      name: "checkCommand",
      message: "Input check command",
      default: "pnpm tsc -p . --noEmit",
    },
    {
      type: "input",
      name: "checkFilesCommand",
      message:
        "Input check files command. <files> is replaced by the file names.",
      default: "pnpm eslint <files>",
    },
    {
      type: "input",
      name: "defaultBranch",
      message: "Input default branch",
      default: "main",
    },
    {
      type: "input",
      name: "branchPrefix",
      message: "Input branch prefix",
      default: "claude-crew/",
    },
    {
      type: "select",
      name: "githubPullRequest",
      message: "Allow claude to create pull request?",
      choices: ["always", "draft", "never"],
      default: "draft",
    },
    {
      type: "select",
      name: "runtime",
      message: "Select runtime (local is recommended)",
      choices: ["local", "container"],
      default: "local",
    },
    {
      type: "confirm",
      name: "customDb",
      message: "Use custom database?",
      default: false,
    },
    {
      type: "input",
      name: "databaseUrl",
      message: "Input database URL",
      when: (answers) => answers.customDb,
    },
    {
      type: "password",
      name: "openaiApiKey",
      message: "Input your OpenAI API key",
      validate: (input: string) => {
        if (!input) return "API key is required"
        if (!input.startsWith("sk-"))
          return "Invalid API key format. OpenAI API keys start with 'sk-'"
        return true
      },
    },
  ])

  return {
    answers,
  }
}
