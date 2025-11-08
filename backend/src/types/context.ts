export interface RequestContext {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

export interface EmailMetadata extends RequestContext {
  userId?: string;
  recipient?: string;
  context?: string;
}
