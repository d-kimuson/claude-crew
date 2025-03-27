export class DiscriminatedError<
  const Code extends string,
  Details,
  E,
> extends Error {
  constructor(
    public readonly code: Code,
    message: string,
    public readonly details: Details,
    cause?: E
  ) {
    super(message)
    if (cause) {
      this.cause = cause
    }
    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack
    }
  }
}
