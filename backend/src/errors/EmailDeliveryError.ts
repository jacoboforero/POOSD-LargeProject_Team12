import { EmailMetadata } from "../types/context";

export class EmailDeliveryError extends Error {
  public readonly status = 502;
  public readonly metadata: EmailMetadata;
  public readonly cause?: Error;

  constructor(message: string, metadata: EmailMetadata = {}, cause?: unknown) {
    super(message);
    this.name = "EmailDeliveryError";
    this.metadata = metadata;
    if (cause instanceof Error) {
      this.cause = cause;
    }
  }
}
