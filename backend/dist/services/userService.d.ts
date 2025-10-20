export declare class UserService {
    getMe(userId: string): Promise<{
        _id: any;
        email: any;
        emailVerified: any;
        preferences: any;
        timezone: any;
        notificationPrefs: any;
        createdAt: any;
        updatedAt: any;
    }>;
    getUsage(userId: string): Promise<{
        totalBriefings: number;
        completedBriefings: number;
        queuedBriefings: number;
        failedBriefings: number;
        dailyUsage: number;
        quota: {
            daily: number;
            monthly: number;
            remaining: number;
        };
    }>;
    updatePreferences(userId: string, preferences: any): Promise<{
        _id: any;
        email: any;
        emailVerified: any;
        preferences: any;
        timezone: any;
        notificationPrefs: any;
        createdAt: any;
        updatedAt: any;
    }>;
}
export declare const userService: UserService;
//# sourceMappingURL=userService.d.ts.map