import type { Config } from "../config/schema"

export const withConfig = <T>(cb: (config: Config) => T) => cb
