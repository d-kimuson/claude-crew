# Claude Crew Development Guidelines

## Commands

- Build: `pnpm build` (alias: `run-p build:*`)
- Build schema: `pnpm build:schema`
- Lint: `pnpm lint` (runs cspell, prettier, eslint)
- Fix: `pnpm fix` (auto-fixes prettier & eslint issues)
- Test: `pnpm test` (runs all tests)
- Test single file: `pnpm vitest run <file>`
- Type check: `pnpm typecheck`

## Code Style

- **TypeScript**: Strict typing with no `any` or non-null assertions
- **Imports**: Order - builtin → external → type → internal → parent → index → sibling
- **Types**: Use `type` instead of `interface`, property-style method signatures
- **Naming**: Avoid unused variables (prefix with `_` if necessary)
- **Assertions**: Never use type assertions (configure with `assertionStyle: "never"`)
- **Error handling**: Use `DiscriminatedError` for typed errors, `unhandledError` for centralized handling
- **Comments**: Use `@ts-expect-error` with description (never `@ts-ignore` or `@ts-nocheck`)

Adheres to ESLint, TypeScript-ESLint, and Prettier standards. TypeScript projects are configured in tsconfig files.
