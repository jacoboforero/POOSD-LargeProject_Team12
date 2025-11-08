// Re-export everything for consumers

// utils
export * from "./utils/common";

// errors
export * from "./errors/errorCodes";
export * from "./errors/errorSchema";

// config
export * from "./config/config.schema";

// domain
export * from "./domain/User.schema";
export * from "./domain/Briefing.schema";
export * from "./domain/ArticleCache.schema";
export * from "./domain/AuditLog.schema";

// dto - auth
export * from "./dto/auth/OtpRequest.schema";
export * from "./dto/auth/OtpVerify.schema";
export * from "./dto/auth/Session.schema";

// dto - users
export * from "./dto/users/Me.schema";
export * from "./dto/users/PreferencesUpdate.schema";
export * from "./dto/users/ProfileUpdate.schema";
export * from "./dto/users/Usage.schema";
export * from "./dto/users/Schedule.schema";
export * from "./dto/users/PushToken.schema";

// dto - briefings
export * from "./dto/briefings/GenerateRequest.schema";
export * from "./dto/briefings/BriefingResponse.schema";
export * from "./dto/briefings/BriefingStatus.schema";
export * from "./dto/briefings/ListQuery.schema";
export * from "./dto/briefings/ListResponse.schema";
