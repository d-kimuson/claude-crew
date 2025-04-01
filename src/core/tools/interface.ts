export type InternalToolResult =
  | {
      success: true
      [K: string]: unknown
    }
  | {
      success: false
      meta?: unknown
      error: unknown
    }
