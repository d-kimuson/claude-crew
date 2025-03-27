import { DiscriminatedError } from "./DiscriminatedError"

export const unhandledError = (
  cause: unknown,
  data?: {
    method?: string
  }
) => {
  return new DiscriminatedError(
    "UNHANDLED_ERROR",
    "Unhandled error",
    {
      ...data,
    },
    cause
  )
}
