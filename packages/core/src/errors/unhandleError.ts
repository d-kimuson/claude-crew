import { DiscriminatedError } from "./DiscriminatedError"

export const unhandledError = (
  cause: unknown,
  data?: {
    method?: string
  }
) => {
  return new DiscriminatedError(
    "UnhandledError",
    "Unhandled error",
    {
      ...data,
    },
    cause
  )
}
