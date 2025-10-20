import { BriefingGenerateRequest } from "../../../packages/contracts/src";
export declare class BriefingService {
    generateBriefing(userId: string, request: BriefingGenerateRequest): Promise<{
        briefingId: string;
    }>;
    getBriefingStatus(briefingId: string): Promise<{
        _id: any;
        status: any;
        createdAt: any;
        updatedAt: any;
    }>;
    getBriefing(briefingId: string): Promise<any>;
    getUserBriefings(userId: string, limit?: number, offset?: number): Promise<z.infer<any>[]>;
    private processBriefing;
}
export declare const briefingService: BriefingService;
//# sourceMappingURL=briefingService.d.ts.map