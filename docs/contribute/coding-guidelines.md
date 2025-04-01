# Coding Guidelines

This guideline outlines the conventions for maintaining code consistency and quality in the Claude Crew project.
Many basic coding conventions are automatically enforced by ESLint. This guideline explains project-specific important conventions.

## TypeScript

### Logging

Direct use of `console` is prohibited (enforced by ESLint). Instead, use `lib/logger`:

```typescript
import { logger } from "../lib/logger"

logger.debug("Detailed debug information")
logger.info("Start/completion of important processes")
logger.warn("Potential issues")
logger.error("Error occurred", error)
```

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) format.

```
feat: Add new search functionality
fix: Fix crash during login
docs: Update README
refactor: Refactor authentication logic
```
