import { z } from "zod";
export declare const UserPreferencesSchema: any;
export declare const UserLimitsSchema: any;
export declare const OtpStateSchema: any;
export declare const PushTokenSchema: any;
export declare const UserSchema: any;
export type User = z.infer<typeof UserSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
//# sourceMappingURL=User.schema.d.ts.map