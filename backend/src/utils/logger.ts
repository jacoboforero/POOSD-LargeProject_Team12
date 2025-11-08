type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogMetadata {
  requestId?: string;
  [key: string]: unknown;
}

const formatLog = (level: LogLevel, message: string, metadata: LogMetadata = {}) => {
  const payload = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...metadata,
  };

  return JSON.stringify(payload);
};

export const logInfo = (message: string, metadata?: LogMetadata) => {
  console.log(formatLog("info", message, metadata));
};

export const logWarn = (message: string, metadata?: LogMetadata) => {
  console.warn(formatLog("warn", message, metadata));
};

export const logError = (message: string, metadata?: LogMetadata) => {
  console.error(formatLog("error", message, metadata));
};

export const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    const serialized: Record<string, unknown> = {
      name: error.name,
      message: error.message,
    };

    const anyError = error as unknown as Record<string, unknown>;
    if (typeof anyError.code === "string") {
      serialized.code = anyError.code;
    }
    if (typeof anyError.response === "string") {
      serialized.providerResponse = anyError.response;
    }

    return serialized;
  }

  return { message: String(error) };
};
