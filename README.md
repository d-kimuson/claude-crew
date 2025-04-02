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
- OpenAI API key for embedding (optional - but recommended for better context understanding)
- Docker and Docker Compose (Not required when using custom database)
- Node.js >= v20

## Features

- 🚀 Easy setup through interactive dialog
- 🔄 Smooth integration with Claude Desktop
- 📝 Automatic instruction generation for Claude Projects
- 🛠️ Customizable project workflow commands
- 🌐 Multi-language support (Full TypeScript support, basic file operations for other languages)
- 🔍 Enhanced context understanding through OpenAI embedding (optional)
- 💪 High-precision TypeScript support utilizing type information
- 🔌 Support for custom PostgreSQL database instead of Docker
- 🧠 Memory Bank functionality for persistent project knowledge

## Quick Start

### Project Setup

Move to your project directory and run the setup:

```bash
cd /path/to/your-project
npx claude-crew@latest setup
```

Configuration files will be generated under `.claude-crew` through an interactive setup process.

> **Note**: Claude Crew can be used with multiple projects simultaneously. Each project generates its own unique configuration, and tool settings are created with project-specific naming to prevent conflicts. For example:

```json
// Project A: /path/to/project-a/.claude-crew/mcp.json
{
  "tools": {
    "project_a_run_test": { ... },
    "project_a_check_types": { ... }
  }
}

// Project B: /path/to/project-b/.claude-crew/mcp.json
{
  "tools": {
    "project_b_run_test": { ... },
    "project_b_check_types": { ... }
  }
}
```

> **Tip**: For easier project management, we recommend cloning projects that use Claude Crew into separate repositories. This allows you to manage the configuration and state of each project independently.

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
     - Update project to latest state
     - Resolve dependencies
   - Provide LLM with:
     - Project structure
     - Related source code
     - Related documentation
     - Test environment information
     - Memory Bank for persistent project knowledge

3. **Autonomous Task Execution**
   - LLM starts working based on provided information
     - Linter code quality checks
     - Unit test execution
     - Type checking
   - Implement necessary corrections based on feedback results

Information obtained at each step is optimized for efficient use of the LLM's context window.

## Configuration

The following settings can be customized in `.claude-crew/config.json`:

| Category     | Setting               | Default Value                                                          | Description                                                            |
| ------------ | --------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Basic**    |
|              | `name`                | Project name                                                           | Project name                                                           |
|              | `directory`           | Current directory                                                      | Project root directory                                                 |
|              | `language`            | "日本語"                                                               | Language for Claude interaction                                        |
| **Commands** |
|              | `commands.install`    | "pnpm i"                                                               | Command to install dependencies                                        |
|              | `commands.build`      | "pnpm build"                                                           | Build command                                                          |
|              | `commands.test`       | "pnpm test"                                                            | Test execution command                                                 |
|              | `commands.testFile`   | "pnpm vitest run <file>"                                               | Single file test command. <file> is replaced with absolute path        |
|              | `commands.checks`     | ["pnpm tsc -p . --noEmit"]                                             | Validation commands like type checking                                 |
|              | `commands.checkFiles` | ["pnpm eslint <files>"]                                                | File-specific validation commands. <files> is replaced with paths list |
| **Database** |
|              | `database.url`        | "postgresql://postgres:postgres@127.0.0.1:6432/claude-crew-embeddings" | PostgreSQL connection URL. Use your own DB URL when customDb is true   |
|              | `database.port`       | 6432                                                                   | Port number for built-in Docker DB (ignored when customDb is true)     |
|              | `database.customDb`   | false                                                                  | Set to true to use your own PostgreSQL database instead of Docker      |

## Integrations

Claude Crew provides several integrations as extensions. These can be enabled and configured in the `integrations` section of the configuration file.

## Collaboration with Other MCP Tools

While Claude Crew can be used alongside other MCP tools, we recommend following these guidelines:

### Recommended: Disable Similar Tools

We recommend disabling similar tools such as `filesystem` and `claude-code`.

**Reasons:**

- AI agents can proceed with tasks more efficiently when there are fewer choices
- Having duplicate functionality may cause the AI agent to consume extra context in selecting the optimal tool

### Browser Operation Tools

While you can use browser operation tools like `playwright-mcp` to perform browser-based tasks, consider the following:

- Browser-based operation verification tends to consume more context compared to unit testing
- Browser operation tools are not recommended when unit tests can provide sufficient verification
- Consider using browser operation tools when unit testing is challenging (e.g., visual UI verification, complex user interaction testing)

### Adding Custom Instructions

Currently, there is no built-in functionality to automatically integrate custom instructions for other tools.

Alternatives:

- Manually append to the CLI-generated instructions (`.claude-crew/instruction.md`)
- Add instructions for additional tools directly to your project's custom instructions

### Available Integrations

#### TypeScript Integration

An integration that enhances support for TypeScript projects.

```json
{
  "name": "typescript",
  "config": {
    "tsConfigFilePath": "./tsconfig.json"
  }
}
```

| Setting            | Description                               |
| ------------------ | ----------------------------------------- |
| `tsConfigFilePath` | Path to the TypeScript configuration file |

**Provided Tools:**

- `{project_name}-search-typescript-declaration` - Search for TypeScript declarations by identifier (function name, class name, interface name, etc.)

#### RAG Integration (Retrieval-Augmented Generation)

An extension for searching related documents and information within your project.

```json
{
  "name": "rag",
  "config": {
    "provider": {
      "type": "openai",
      "apiKey": "your-openai-api-key",
      "model": "text-embedding-ada-002"
    }
  }
}
```

| Setting           | Default Value            | Description                                                       |
| ----------------- | ------------------------ | ----------------------------------------------------------------- |
| `provider.type`   | "openai"                 | Type of embedding provider (currently only "openai" is supported) |
| `provider.apiKey` | -                        | OpenAI API key                                                    |
| `provider.model`  | "text-embedding-ada-002" | Embedding model to use                                            |

**Provided Tools:**

- `{project_name}-find-relevant-documents` - Find relevant documents based on a query
- `{project_name}-find-relevant-resources` - Find relevant resources based on a query

## Memory Bank

Claude Crew creates a `.claude-crew/memory-bank.md` file to store persistent project knowledge. This file is automatically loaded at the start of each task and contains sections for:

- Project Brief
- Product Context
- System Patterns
- Coding Guidelines

The Memory Bank is designed to be updated throughout project development, serving as a knowledge repository for the AI agent.

## Snippets

Since Claude Desktop does not have an automatic MCP approval feature, we provide a script for automatic approval. This is optional, not mandatory.

The snippet provides the following features:

### Key Features

- **Automatic Tool Approval**: Automatically approves execution of trusted tools (those prefixed with `claude-crew-`)
- **Message Sending Control**: Recommended especially for non-English input. Enables message sending with Ctrl+Enter (optional)

### Usage

1. Generate the snippet:

```bash
# Basic usage
npx claude-crew@latest create-snippet

# Disable Enter key message sending
npx claude-crew@latest create-snippet --disable-send-enter

# Specify output file
npx claude-crew@latest create-snippet --outfile path/to/snippet.js
```

2. Apply in Claude Desktop:
   - Launch Claude Desktop
   - Press `Cmd + Alt + Shift + i` to open Developer Console
   - Paste and execute the generated snippet content in the console

### Options

| Option                 | Default Value            | Description                                              |
| ---------------------- | ------------------------ | -------------------------------------------------------- |
| `--disable-send-enter` | `false`                  | When `true`, disables message sending on Enter key press |
| `--outfile`            | `claude_crew_snippet.js` | Output file path for the generated snippet               |

## CLI Commands

Claude Crew provides the following CLI commands:

- `setup` - Interactive project setup
- `setup-db` - Manual database setup (useful for reinstallation)
- `clean` - Remove Docker containers and volumes to reset to pre-setup state
- `serve-mcp` - Run the MCP server for Claude Desktop integration
- `create-snippet` - Create a helper script for Claude Desktop
  - `--disable-send-enter` - Disable sending message on Enter key press (default: false)
  - `--outfile` - Output file path (default: claude_crew_snippet.js)

## Contributing

Contributions are welcome! You can participate in the following ways:

- Report bugs and feature requests via Issues
- Submit improvements via Pull Requests

## License

This project is released under the MIT License. See [LICENSE](LICENSE) file for details.
