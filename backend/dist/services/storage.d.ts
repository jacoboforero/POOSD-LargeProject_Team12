import { User, Briefing, Session, BriefingGenerateRequest } from "../../../packages/contracts/src";
declare class InMemoryStorage {
    private users;
    private briefings;
    private sessions;
    private otpRequests;
    createUser(userData: Partial<User>): User;
    getUserById(id: string): User | undefined;
    getUserByEmail(email: string): User | undefined;
    updateUser(id: string, updates: Partial<User>): User | undefined;
    createSession(user: User, token: string): Session;
    getSession(token: string): Session | undefined;
    deleteSession(token: string): boolean;
    createOtpRequest(email: string): {
        code: string;
        expiresAt: Date;
    };
    verifyOtpRequest(email: string, code: string): boolean;
    createBriefing(userId: string, request: BriefingGenerateRequest): Briefing;
    getBriefing(id: string): Briefing | undefined;
    updateBriefing(id: string, updates: Partial<Briefing>): Briefing | undefined;
    getUserBriefings(userId: string): Briefing[];
}
export declare const storage: InMemoryStorage;
export {};
//# sourceMappingURL=storage.d.ts.map