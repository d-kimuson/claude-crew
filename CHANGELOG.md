# Changelog

## 0.0.10

### &nbsp;&nbsp;&nbsp;Bug Fixes

- Setup command failed with no existing config &nbsp;-&nbsp; by **d-kimsuon** [<samp>(fb9fd)</samp>](https://github.com/d-kimuson/claude-crew/commit/fb9fdbf)
- Update default value for addAnother prompt in REPL setup &nbsp;-&nbsp; by **d-kimsuon** [<samp>(d5c98)</samp>](https://github.com/d-kimuson/claude-crew/commit/d5c98bf)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/d-kimuson/claude-crew/compare/0.0.9...0.0.10)

## 0.0.9

### &nbsp;&nbsp;&nbsp;Features

- Add Git configuration options for default branch and auto-pull functionality &nbsp;-&nbsp; by **d-kimsuon** [<samp>(a706e)</samp>](https://github.com/d-kimuson/claude-crew/commit/a706ede)
- Make bash tool integration &nbsp;-&nbsp; by **d-kimsuon** [<samp>(46b95)</samp>](https://github.com/d-kimuson/claude-crew/commit/46b9517)

### &nbsp;&nbsp;&nbsp;Bug Fixes

- Bug that MCP server output log to stdout by ora &nbsp;-&nbsp; by **d-kimsuon** [<samp>(4acdc)</samp>](https://github.com/d-kimuson/claude-crew/commit/4acdcf9)
- Remove mcp server's imvalid stdout &nbsp;-&nbsp; by **d-kimsuon** [<samp>(a30cd)</samp>](https://github.com/d-kimuson/claude-crew/commit/a30cd5d)
- Correct regex escape sequences in snippet template for tool name extraction &nbsp;-&nbsp; by **d-kimsuon** [<samp>(10664)</samp>](https://github.com/d-kimuson/claude-crew/commit/106649e)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/d-kimuson/claude-crew/compare/0.0.8...0.0.9)

## 0.0.8

### &nbsp;&nbsp;&nbsp;Breaking Changes

- Remove xenova adapter &nbsp;-&nbsp; by **d-kimsuon** [<samp>(73982)</samp>](https://github.com/d-kimuson/claude-crew/commit/73982c0)

### &nbsp;&nbsp;&nbsp;Features

- Switch the RAG feature’s indexing functionality to incremental (differential) updates &nbsp;-&nbsp; by **d-kimsuon** [<samp>(6779f)</samp>](https://github.com/d-kimuson/claude-crew/commit/6779f30)
- Using not mtime but contentHash check for diff indexing &nbsp;-&nbsp; by **d-kimsuon** [<samp>(ecabf)</samp>](https://github.com/d-kimuson/claude-crew/commit/ecabf19)
- Add clean command to remove containers and volumes &nbsp;-&nbsp; by **d-kimsuon** [<samp>(37c7e)</samp>](https://github.com/d-kimuson/claude-crew/commit/37c7e06)
- Update file write and replace methods to return operation results &nbsp;-&nbsp; by **d-kimsuon** [<samp>(5410f)</samp>](https://github.com/d-kimuson/claude-crew/commit/5410f85)
- Implement memory bank functionality and update prompt preparation &nbsp;-&nbsp; by **d-kimsuon** [<samp>(0456b)</samp>](https://github.com/d-kimuson/claude-crew/commit/0456bac)
- Enhance REPL setup with existing configuration support &nbsp;-&nbsp; by **d-kimsuon** [<samp>(80a65)</samp>](https://github.com/d-kimuson/claude-crew/commit/80a657b)
- Enhance REPL setup with multiple input handling and project command prompts &nbsp;-&nbsp; by **d-kimsuon** [<samp>(b3133)</samp>](https://github.com/d-kimuson/claude-crew/commit/b313361)
- Update command handling in REPL setup for improved input management &nbsp;-&nbsp; by **d-kimsuon** [<samp>(b3cda)</samp>](https://github.com/d-kimuson/claude-crew/commit/b3cda34)
- Refine Memory Bank documentation structure and update guidelines &nbsp;-&nbsp; by **d-kimsuon** [<samp>(1991b)</samp>](https://github.com/d-kimuson/claude-crew/commit/1991bf5)
- Update prompt guidelines to enhance task execution clarity &nbsp;-&nbsp; by **d-kimsuon** [<samp>(f25fa)</samp>](https://github.com/d-kimuson/claude-crew/commit/f25fa02)
- Make embedding feature optional &nbsp;-&nbsp; by **d-kimsuon** [<samp>(f4218)</samp>](https://github.com/d-kimuson/claude-crew/commit/f421837)
- Update type annotation for maxLine parameter in readFile function &nbsp;-&nbsp; by **d-kimsuon** [<samp>(85c63)</samp>](https://github.com/d-kimuson/claude-crew/commit/85c6358)
- Add create-snippet command for generating Claude Desktop helper script &nbsp;-&nbsp; by **d-kimsuon** [<samp>(7e993)</samp>](https://github.com/d-kimuson/claude-crew/commit/7e993b0)
- Enhance embedding configuration schema &nbsp;-&nbsp; by **d-kimsuon** [<samp>(96497)</samp>](https://github.com/d-kimuson/claude-crew/commit/96497c7)
- Add check-all tool execution step to final confirmation in task flow &nbsp;-&nbsp; by **d-kimsuon** [<samp>(7f662)</samp>](https://github.com/d-kimuson/claude-crew/commit/7f66253)
- Integrate TypeScript support with configuration and tools &nbsp;-&nbsp; by **d-kimsuon** [<samp>(7695d)</samp>](https://github.com/d-kimuson/claude-crew/commit/7695ddc)
- Implement integration system and moved typescript tool to integration &nbsp;-&nbsp; by **d-kimsuon** [<samp>(3447b)</samp>](https://github.com/d-kimuson/claude-crew/commit/3447b0b)
- Moved rag feature to integration &nbsp;-&nbsp; by **d-kimsuon** [<samp>(dad42)</samp>](https://github.com/d-kimuson/claude-crew/commit/dad4296)
- Add create-instruction command to generate instruction file from config &nbsp;-&nbsp; by **d-kimsuon** [<samp>(b1b45)</samp>](https://github.com/d-kimuson/claude-crew/commit/b1b4576)
- Enhance setup process with database initialization and updated progress steps &nbsp;-&nbsp; by **d-kimsuon** [<samp>(239b4)</samp>](https://github.com/d-kimuson/claude-crew/commit/239b409)

### &nbsp;&nbsp;&nbsp;Bug Fixes

- Format RAG content before returning in find-relevant-documents and find-relevant-resources &nbsp;-&nbsp; by **d-kimsuon** [<samp>(4e001)</samp>](https://github.com/d-kimuson/claude-crew/commit/4e001c0)
- Bug setup-db command doesn't close process after task completed &nbsp;-&nbsp; by **d-kimsuon** [<samp>(f5560)</samp>](https://github.com/d-kimuson/claude-crew/commit/f5560b7)
- Remove all stdout logging in MCP server &nbsp;-&nbsp; by **d-kimsuon** [<samp>(62e34)</samp>](https://github.com/d-kimuson/claude-crew/commit/62e34dc)
- Bug that 1'st command asked anthor command? &nbsp;-&nbsp; by **d-kimsuon** [<samp>(e7ee6)</samp>](https://github.com/d-kimuson/claude-crew/commit/e7ee6e9)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/d-kimuson/claude-crew/compare/0.0.7...0.0.8)

## 0.0.7

### &nbsp;&nbsp;&nbsp;Bug Fixes

- Error that find-relevant-resources duplicated &nbsp;-&nbsp; by **d-kimsuon** [<samp>(39c16)</samp>](https://github.com/d-kimuson/claude-crew/commit/39c1631)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/d-kimuson/claude-crew/compare/0.0.6...0.0.7)

## 0.0.6

### &nbsp;&nbsp;&nbsp;Bug Fixes

- Fix bug that logger calls maximum calls &nbsp;-&nbsp; by **d-kimsuon** [<samp>(8f6c0)</samp>](https://github.com/d-kimuson/claude-crew/commit/8f6c011)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/d-kimuson/claude-crew/compare/0.0.5...0.0.6)

## 0.0.5

### &nbsp;&nbsp;&nbsp;Features

- Add setup-db command (for manually setup) &nbsp;-&nbsp; by **d-kimsuon** [<samp>(0237a)</samp>](https://github.com/d-kimuson/claude-crew/commit/0237a1f)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/d-kimuson/claude-crew/compare/0.0.4...0.0.5)

## 0.0.4

### &nbsp;&nbsp;&nbsp;Features

- Support custom db &nbsp;-&nbsp; by **d-kimsuon** [<samp>(8a342)</samp>](https://github.com/d-kimuson/claude-crew/commit/8a34243)

### &nbsp;&nbsp;&nbsp;Bug Fixes

- Fix mcpConfig's command to be valid &nbsp;-&nbsp; by **d-kimsuon** [<samp>(a7d7c)</samp>](https://github.com/d-kimuson/claude-crew/commit/a7d7c4d)
- Git status check missed &nbsp;-&nbsp; by **d-kimsuon** [<samp>(46fbe)</samp>](https://github.com/d-kimuson/claude-crew/commit/46fbe6a)
- Migration not working &nbsp;-&nbsp; by **d-kimsuon** [<samp>(87633)</samp>](https://github.com/d-kimuson/claude-crew/commit/876336c)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/d-kimuson/claude-crew/compare/0.0.3...0.0.4)

## 0.0.3

_No significant changes_

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/d-kimuson/claude-crew/compare/0.0.2...0.0.3)

## 0.0.2

### &nbsp;&nbsp;&nbsp;Features

- Add think tool &nbsp;-&nbsp; by **d-kimsuon** [<samp>(0fb35)</samp>](https://github.com/d-kimuson/claude-crew/commit/0fb351d)
- Add project info response for prepare tool &nbsp;-&nbsp; by **d-kimsuon** [<samp>(dcdb3)</samp>](https://github.com/d-kimuson/claude-crew/commit/dcdb3e4)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/d-kimuson/claude-crew/compare/0.0.1...0.0.2)

## 0.0.1

### &nbsp;&nbsp;&nbsp;Features

- Merge cli and mcp-server &nbsp;-&nbsp; by **d-kimsuon** [<samp>(e8a97)</samp>](https://github.com/d-kimuson/claude-crew/commit/e8a97e6)
- JsonSchema support &nbsp;-&nbsp; by **d-kimsuon** [<samp>(ce1ba)</samp>](https://github.com/d-kimuson/claude-crew/commit/ce1ba2c)
- Add xenova embeddings adapter &nbsp;-&nbsp; by **d-kimsuon** [<samp>(56b4d)</samp>](https://github.com/d-kimuson/claude-crew/commit/56b4d1f)
- **\***:
  - Implement setup project and prepare tool &nbsp;-&nbsp; by **d-kimsuon** [<samp>(ff5c1)</samp>](https://github.com/d-kimuson/claude-crew/commit/ff5c127)
  - Implement editor tools &nbsp;-&nbsp; by **d-kimsuon** [<samp>(d30dc)</samp>](https://github.com/d-kimuson/claude-crew/commit/d30dc4d)
  - Create instruction.md when setup command executed. &nbsp;-&nbsp; by **d-kimsuon** [<samp>(c6259)</samp>](https://github.com/d-kimuson/claude-crew/commit/c625916)

### &nbsp;&nbsp;&nbsp;Bug Fixes

- Separate documentQuery and resourceQuery for prepare task &nbsp;-&nbsp; by **d-kimsuon** [<samp>(f35a1)</samp>](https://github.com/d-kimuson/claude-crew/commit/f35a104)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/d-kimuson/claude-crew/compare/c67ba5cc2ffbc6ba0c1cca15c184860b024cc7ed...0.0.1)
