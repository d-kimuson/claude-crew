# Claude Crew 🤖

[![npm version](https://badge.fury.io/js/claude-crew.svg)](https://badge.fury.io/js/claude-crew)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

English | [日本語](README.ja.md)

Claude Crew is a tool for creating autonomous coding agents like OpenHands using Claude Desktop and Model Context Protocol (MCP). Unlike coding assistants like Cline that focus on real-time collaboration, Claude Crew aims to create agents that can process tasks autonomously.

## Concept

Claude Crew focuses on three key elements to maximize LLM performance:

- 🎯 Maximizing cost efficiency through efficient context window usage
- 🧪 Prioritizing operation verification through unit testing over browser integration for better token cost performance
- 🔄 Providing project-optimized MCP and context information rather than generic filesystem operations and shell MCP

## Requirements

- Claude Desktop
- OpenAI API key for embedding (Optional: can use local embedding with Xenova instead)
- Docker and Docker Compose (Not required when using custom database)
- Node.js >= v20

## Features

- 🚀 Easy setup through interactive dialog
- 🔄 Smooth integration with Claude Desktop
- 📝 Automatic instruction generation for Claude Projects
- 🛠️ Customizable project workflow commands
- 🌐 Multi-language support (Full TypeScript support, basic file operations for other languages)
- 🔍 Enhanced context understanding through local embedding (supports both OpenAI and Xenova)
- 💪 High-precision TypeScript support utilizing type information
- 🔌 Support for custom PostgreSQL database instead of Docker

## Quick Start

### Project Setup

Move to your project directory and run the setup:

```bash
cd /path/to/your-project
npx claude-crew@latest setup
```

Configuration files will be generated under `.claude-crew` through an interactive setup process.

### Claude Desktop Setup

1. Add the MCP settings from `.claude-crew/mcp.json` to `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Launch Claude Desktop and create a new Project
3. Add the content of `.claude-crew/instruction.md` to the project's custom instructions

Setup complete! 🎉

## How it works

Claude Crew processes tasks in the following flow:

1. **Task Reception**

   - Receive task requests from users

2. **Project Information Provision**

   - `prepare` tool is automatically invoked to:
     - Create a working branch
     - Update project to latest state
     - Resolve dependencies
   - Provide LLM with:
     - Project structure
     - Related source code
     - Related documentation
     - Test environment information

3. **Autonomous Task Execution**
   - LLM starts working based on provided information
   - Automatic file operations include:
     - Linter code quality checks
     - Unit test execution
     - Type checking
   - Implement necessary corrections based on feedback results
   - Create commits and propose pull requests

Information obtained at each step is optimized for efficient use of the LLM's context window.

## Configuration

The following settings can be customized in `.claude-crew/config.json`:

| Category      | Setting                     | Default Value                                                          | Description                                                            |
| ------------- | --------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Basic**     |
|               | `name`                      | Project name                                                           | Project name                                                           |
|               | `directory`                 | Current directory                                                      | Project root directory                                                 |
|               | `language`                  | "日本語"                                                               | Language for Claude interaction                                        |
| **Commands**  |
|               | `commands.install`          | "pnpm i"                                                               | Command to install dependencies                                        |
|               | `commands.build`            | "pnpm build"                                                           | Build command                                                          |
|               | `commands.test`             | "pnpm test"                                                            | Test execution command                                                 |
|               | `commands.testFile`         | "pnpm vitest run <file>"                                               | Single file test command. <file> is replaced with absolute path        |
|               | `commands.checks`           | ["pnpm tsc -p . --noEmit"]                                             | Validation commands like type checking                                 |
|               | `commands.checkFiles`       | ["pnpm eslint <files>"]                                                | File-specific validation commands. <files> is replaced with paths list |
| **Git**       |
|               | `git.defaultBranch`         | "main"                                                                 | Default branch name                                                    |
|               | `git.branchPrefix`          | "claude-crew/"                                                         | Working branch prefix                                                  |
| **GitHub**    |
|               | `github.createPullRequest`  | "draft"                                                                | PR creation method (always/draft/never)                                |
| **Database**  |
|               | `database.url`              | "postgresql://postgres:postgres@127.0.0.1:6432/claude-crew-embeddings" | PostgreSQL connection URL. Use your own DB URL when customDb is true   |
|               | `database.port`             | 6432                                                                   | Port number for built-in Docker DB (ignored when customDb is true)     |
|               | `database.customDb`         | false                                                                  | Set to true to use your own PostgreSQL database instead of Docker      |
| **Embedding** |
|               | `embedding.provider.type`   | "openai" or "xenova"                                                   | Embedding provider type                                                |
|               | `embedding.provider.apiKey` | -                                                                      | OpenAI API key (required when type is "openai")                        |
|               | `embedding.provider.model`  | "text-embedding-ada-002"                                               | OpenAI embedding model (used when type is "openai")                    |

## Contributing

Contributions are welcome! You can participate in the following ways:

- Report bugs and feature requests via Issues
- Submit improvements via Pull Requests

## License

This project is released under the MIT License. See [LICENSE](LICENSE) file for details.
