import { OtpRequest, Session } from "../../../packages/contracts/src";
export declare class AuthService {
    requestOtp(request: OtpRequest): Promise<void>;
    verifyOtp(email: string, code: string): Promise<Session>;
    validateToken(token: string): Promise<Session | null>;
    logout(token: string): Promise<void>;
}
export declare const authService: AuthService;
//# sourceMappingURL=authService.d.ts.map