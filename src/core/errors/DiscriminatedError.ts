export class DiscriminatedError<
  const Code extends string,
  Details,
  E,
> extends Error {
  public readonly details: Details | undefined = undefined

  constructor(
    public readonly code: Code,
    message: string,
    public data: Details,
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
