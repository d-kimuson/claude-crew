import type { Context } from "./interface"

export const withContext = <T>(cb: (ctx: Context) => T) => cb
